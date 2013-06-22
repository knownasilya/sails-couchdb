/* sails-couchdb
 * A coucndb adapter for waterline.
 *
 * Cristian Vergara
 * Crave Programming Inc.
 */

// Grab our dependencies
var async = require('async')
  , couchdb = require('felix-couchdb')
  , _ = require('underscore')
  , crypto = require('crypto')
  , moment = require('moment');


module.exports = (function(){

  // Maintains our collections
  var coll = {};

  // Keeps our current database connections
  var dbs = {};

  var adapter = {
    syncable: true, 

    // This function is for adding the collection to our design docs.
    registerCollection: function(collection, cb) {

      coll[collection.identity] = _.each(coll, function(cln){
        return collection.database === cln.database;
      })

      if (!coll[collection.identity]){
        coll[collection.identity] = collection;
      }
      coll[collection.identity]._views = {};
      coll[collection.identity].schema = {};
      if (cb) return cb();
    },

    // Can't find a use for this. Just execute callback;
    teardown: function(cb) {
      cb && cb();
    },


    // Creates a view in the design doc to filter for the models based on required keys.
    // TODO: Allow required keys to be passed to generateView();
    define: function(collectionName, definition, cb) {
      spawnClient(function __DEFINE__(db, cb){
        var required = "doc";
        var def = _.clone(definition);
        coll[collectionName].schema = def;
        var keys = Object.keys(def);
        var index = [];
        var options = {};
        options.where = {};

        async.series([
          function(cb) {requiredKeys = _.filter(keys,function(key){return def[key].required});
            _.each(requiredKeys,function(value){
              options.where[value] = definition[value];
            });
            cb();
          }],
          function(err){
            if (err) return cb(err);
            generateView(options,function(err,map){
              if (err) return cb(err);
              saveView(collectionName,'id',map,db,function(err,data){
                if (err) return cb(err);
                return cb(err,data);
              });
            });
        });
      },coll[collectionName].config,cb);
    },

    // Simply returns the schema of the given design doc.
    // TODO: prevent associated views from being returned.
    describe: function(collectionName, cb) {
      var des = Object.keys(coll[collectionName].schema).length === 0 ?
        null : coll[collectionName].schema;
      return cb(null, des);
    },

    // TODO: Actually implement. Will only remove associated view. Data remains in DB.
    drop: function(collectionName, cb) {
      spawnClient(function __DROP__(db,cb){

        cb();
      },coll[collectionName].config,cb);
    },
    
    // Creates only if there isn't already a document there.
    // TODO: Overload update() to create event if a document is already in the DB.
    create: function(collectionName, values, cb) {
      spawnClient(function(db,cb){
        async.forEach(Object.keys(coll[collectionName].schema),
          function(key,cb){
            if (coll[collectionName].schema[key].autoIncrement !== true){
              return cb();
            }
            getAutoIncrement(collectionName,key,db,function(err,value){
              if (err) return cb(err);
              values[key] = value;
              return cb();
            });
          }
          ,function(err){db.saveDoc(values,function(err,ok){
            if (err) return cb(err);
            values.id = ok.id;
            values.rev = ok.rev;

            return cb(err,values);
          })}
        );
      }, coll[collectionName].config,cb);
    },

    // Same as create(), but utilizes CouchDB's bulk update functionality.
    createEach: function(collectionName, values, cb){
      spawnClient(function(db,cb){
        db.bulkDocs({"docs":values},function(err,ok){
          if (err) return cb(err);
          formatModelsCreate(values,ok,function(err,results){
            if (err) return cb(err);
            return cb(err,results);
          });
        });
      }, coll[collectionName].config,cb);
    },

    // Views are looked up and saved based on hashes of their "where" field.
    // Generates new view (or grabs old one if available).
    // Updates the doc with the new views.
    // NOTE: Every time you update a design doc, it reruns the map-reduce functions.
    // Not a concern if queries run initially or views created at start.
    // Possible work-around is to reference individual DBs and create multiple design docs.
    // Will explore further. Possibly make it flaggable.

    find: function(collectionName, options, cb) {
      spawnClient(function(db,cb){
        var queryKey = JSON.stringify(Object.keys(options.where).sort());
        createHash(queryKey,function(err,hash){
          if (err) return cb(err);
          generateView(options,function(err,view){
            if(err) return cb(err);
            saveView(collectionName,hash,view,db,function(err,ok){
              if (err) return cb(err);
              generateQuery(options,function(err,query){
                if (err) return cb(err);
                db.view(collectionName,'sails_'+hash,query,function(err,ok){
                  if (err) return cb(err);
                  var schema = coll[collectionName].schema;
                  formatModelsFind(ok.rows,schema,function(err,models){
                    return cb(err,models);
                  });
                });
              });
            });
          });
        });
      },coll[collectionName].config,cb);
    },

    // TODO: Implement
    update: function(collectionName, options, values, cb) {

      // Nothing Here
      cb();
    },

    // TODO: Implement
    destroy: function(collectionName, options, cb) {

      // Nothing Here
      cb();
    },



    // TODO: Implement
    stream: function(collectionName, options, stream) {
      // Nothing Here.

    },

    identity: 'sails-couchdb',



  };
  /*
   * MODULE METHODS
   *
   */

  // Saves a view. Retries if revision number is adjusted.
  var saveView = function(collectionName,viewName,view,db,cb){
    var doc = {};
    var saved = false;


    if(!coll[collectionName]._views["sails_"+viewName]){
      coll[collectionName]._views["sails_"+viewName]=view;
    }
    db.getDoc("_design/"+collectionName,function(err,ok){
      if (err && err.error !== 'not_found') return cb(err);
      doc.views = {};
      if (ok){
        doc.views = _.clone(ok.views);
        doc._rev = ok._rev;
      }
      _.extend(doc.views,coll[collectionName]._views);
      db.saveDesign(collectionName,doc,function(err,ok){
        // Retry at conflict (not tested)
        if (err && err.error === "confict") { return saveView(collectionName,viewName,view,cb); };
        return cb(err,ok);
      });
    });
  };

  // Creates a new client connection for the database. Wrapper for function calls.
  var spawnClient = function(logic, config, cb) {
    var key = [config.database,config.host,config.port].join();
    if(dbs[key]){
      return afterwards();
    }
    var client = couchdb.createClient(config.host, config.port);
    dbs[key] = client.db(config.database);
    afterwards();

    function afterwards() {
      logic(dbs[key], function(err, result) {
        cb(err, result);
      });
    }
  }
  return adapter;
})();

/*
 *  Private Methods
 *
 */

// Generates a view object to be passed to saveView();
var generateView = function(options,cb){
  var mapFunc = "function(doc){if(REQUIRED){emit(EMITTED,doc);}}";
  var view = {};
  var required = "doc";
  var emitted = "[";
  async.forEach(Object.keys(options.where), function(key,cb){
    required = required + " && doc." + key;
    emitted = emitted + "doc." + key + ",";
    cb();
  },function(err){
    emitted = emitted.replace(/,$/,"") + "]";
    mapFunc = mapFunc.replace("REQUIRED",required).replace("EMITTED",emitted).replace(/ +?/g, '');
    view.map = mapFunc;
    return cb(err,view);
  });
};

var generateQuery = function(options,cb){
  var query = {include_docs:true};
  var query = {};
  query.startkey = [];
  query.endkey = [];
  if (options.limit) query.limit = options.limit;
  async.forEach(Object.keys(options.where), function(key,cb){
    query.startkey.push(options.where[key]);
  });
  query.endkey = query.startkey;
  return cb(null,query);
}

// Formats the models returned by CouchDB into a format that waterline accepts.
var formatModelsFind = function(models,schema,cb){
  var results = [];
  async.forEach(Object.keys(schema),function(key,cb){
    if (typeof schema[key] !== 'function') return cb();
    _.each(models,function(model){
      model[key] = schema[key];
    });
    return cb();
  },function(err){
    async.forEach(models,function(model,cb){
      var result = model.value;
      result.id = result._id;
      delete result._id;
      result.rev = result._rev;
      delete result._rev;
      results.push(result);
      cb();
    },function(err){
      if (err) return cb(err);
      cb(err, results);
    });
  });
};
// Shim for createEach() to format the models into a form that waterline accepts.
var formatModelsCreate = function(models,results,cb){
  async.series([function(cb){
    _.each(_.range(models.length),function(value){
      models[value].id = results[value].id;
      models[value].rev = results[value].rev;
    });
    return cb();
  }],function(err){
    if (err) return cb(err);
    return cb(err, models);
  });
};

// Utility function for creating a hash key. Used for indexing views in a design document.
var createHash = function(data,cb){
  var sha256Hash;
  async.series([function(cb){
    sha256Hash = crypto.createHash('sha256');
    cb();
  },
  function(cb){
    sha256Hash.update(data);
    viewName = sha256Hash.digest('hex');
    cb();
  }],function(err){
    cb(err,viewName);
  });
};

var getAutoIncrement = function(collectionName,key,db,cb){
  var docName = collectionName+"_autoIncrement_"+key;
  var values = {};
  values[key] = 1;
  db.getDoc(docName,function(err,ok){
    if (err && err.error!=="not_found") return (err);
    if (ok){
      values = _.clone(ok);
      values[key] = values[key] + 1;  
    }

    db.saveDoc(docName,values,function(err,ok)
    {
      if (err && err.error === "conflict") return getAutoIncrement(collectionName,key,db,cb);
      return cb(err,values[key]);
    });
  });
};
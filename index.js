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
  , crypto = require('crypto');


module.exports = (function(){

  // Maintains our design docs
  var designs = {};

  // Keeps our current database
  var db = {};

  var adapter = {
    syncable: false, 
    defaults: { // Define defaults
      port: 5984,
      host: 'localhost',
      database: 'testdb'
    },

    // This function is for adding the collection to our design docs.
    registerCollection: function(collection, cb) {

      designs[collection.identity] = _.each(designs, function(design){
        return collection.database === design.database;
      })

      if (!designs[collection.identity]){
        designs[collection.identity] = collection;
      }
      designs[collection.identity]._views = {};
      designs[collection.identity].schema = {};

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
        var requiredKeys = {};
        var def = _.clone(definition);
        designs[collectionName].schema = def;
        var keys = Object.keys(def);
        var index = [];

        async.series([
          function(cb) {requiredKeys = _.filter(keys,function(key){return def[key].required;});cb();}],
          function(err){
            generateMap(requiredKeys,function(err,map){
              if (err) return cb(err);
              saveView(collectionName,'id',map,function(err,data){
                if (err) return cb(err);
                return cb(err,data);
              });
            });
        });
      },designs[collectionName].config,cb);
    },

    // Simply returns the schema of the given design doc.
    // TODO: prevent associated views from being returned.
    describe: function(collectionName, cb) {
      var des = Object.keys(designs[collectionName].schema).length === 0 ?
        null : designs[collectionName].schema;
      return cb(null, des);
    },

    // TODO: Actually implement. Will only remove associated view. Data remains in DB.
    drop: function(collectionName, cb) {
      spawnClient(function __DROP__(db,cb){

        cb();
      },designs[collectionName].config,cb);
    },
    
    // Creates only if there isn't already a document there.
    // TODO: Overload update() to create event if a document is already in the DB.
    create: function(collectionName, values, cb) {
      spawnClient(function(db,cb){
        db.saveDoc(values,function(err,ok){
          if (err) return cb(err);
          values.id = ok.id;
          values.rev = ok.rev;
          return cb(err,values);
        });
      }, designs[collectionName].config,cb);
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
      }, designs[collectionName].config,cb);
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
          generateView(options,function(err,view,query){
            if(err) return cb(err);
            saveView(collectionName,hash,view,function(err,ok){
              if (err) return cb(err);
              db.view(collectionName,'sails_'+hash,query,function(err,ok){
                if (err) return cb(err);
                formatModelsFind(ok.rows,function(err,models){
                  return cb(err,models);
                });
              });
            });
          });
        });
      },designs[collectionName].config,cb);
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
  var saveView = function(collectionName,viewName,view,cb){
    var doc = {};
    var saved = false;
    var self = this;


    if(!designs[collectionName]._views["sails_"+viewName]){
      designs[collectionName]._views["sails_"+viewName]=view;
    }
    db.getDoc("_design/"+collectionName,function(err,ok){
      if (err && err.error !== 'not_found') return cb(err);
      doc.views = {};
      if (ok){
        doc.views = _.clone(ok.views);
        doc._rev = ok._rev;
      }
      _.extend(doc.views,designs[collectionName]._views);
      db.saveDesign(collectionName,doc,function(err,ok){
        // Retry at conflict (not tested)
        if (err && err.error === "confict") { self(collectionName,viewName,view,cb); }
        else {return cb(err,ok);}
      });
    });
  };

  // Creates a new client connection for the database. Wrapper for function calls.
  var spawnClient = function(logic, config, cb) {
    if(Object.keys(db).length > 0) {
      return afterwards();
    }
    var client = couchdb.createClient(config.host, config.port);
    db = client.db(config.database);
    afterwards();

    function afterwards() {
      logic(db, function(err, result) {
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
  var query = {include_docs:true};
  query.startkey = [];
  query.endkey = [];
  if (options.limit) query.limit = options.limit;
  var required = "doc";
  var emitted = "[";
  async.forEach(Object.keys(options.where), function(key,cb){
    required = required + " && doc." + key;
    emitted = emitted + "doc." + key + ",";
    query.startkey.push(options.where[key]);
    query.endkey.push(options.where[key]);
    cb();
  },function(err){
    emitted = emitted.replace(/,$/,"") + "]";
    mapFunc = mapFunc.replace("REQUIRED",required).replace("EMITTED",emitted).replace(/ +?/g, '');
    view.map = mapFunc;
    return cb(err,view,query);
  });
};

// Formats the models returned by CouchDB into a format that waterline accepts.
var formatModelsFind = function(models,cb){
  var results = [];
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
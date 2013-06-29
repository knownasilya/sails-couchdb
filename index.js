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
  , utils = require('./utils');


module.exports = (function(){

  // Maintains our collections
  var coll = {};

  // Keeps our current database connections
  var dbs = {};

  var adapter = {
    syncable: true,

    // This registers a collection with this adapter
    registerCollection: function(collection, cb) {

      coll[collection.identity] = _.each(coll, function(cln){
        return collection.database === cln.database;
      })
      if (!coll[collection.identity]){
        coll[collection.identity] = collection;
      }
      coll[collection.identity]._views = {};
      coll[collection.identity].schema = {};
      coll[collection.identity].datesAsArray = collection.config.datesAsArray ?
        collection.config.datesAsArray : false;
      if (cb) return cb();
    },

    // Can't find a use for this. Just execute callback;
    teardown: function(cb) {
      cb && cb();
    },


    // Creates the database if it does not already exist
    define: function(collectionName, definition, cb) {
      spawnClient(function __DEFINE__(db,cb){
        db.create(function(err,ok){
          if(err && err.error !== "file_exists") return cb(err);
          coll[collectionName].schema = definition;
          return cb(null,coll[collectionName].schema);
        });
      },coll[collectionName].config,cb);
    },
 
    // Simply returns the schema of the given design doc.
    describe: function(collectionName, cb) {
      var des = Object.keys(coll[collectionName].schema).length === 0 ?
        null : coll[collectionName].schema;
      return cb(null, des);
    },

    // TODO: Actually implement.
    drop: function(collectionName, cb) {
      spawnClient(function __DROP__(db,cb){
        cb();
      },coll[collectionName].config,cb);
    },
    
    // Creates only if there isn't already a document there.
    create: function(collectionName, values, cb) {
      spawnClient(function __CREATE__(db,cb){
        utils.waterlineToCouch(values,coll[collectionName],db,function(err,formatted){
          if (err) return cb(err);
          db.saveDoc(formatted,function(err,ok){
            if (err) return cb(err);
            if (coll[collectionName].datesAsArray){
              _.each(Object.keys(formatted),function(key){
                if (coll[collectionName].schema[key] && coll[collectionName].schema[key].type === 'date'){
                  formatted[key] = new Date(Date.UTC(formatted[key][0],formatted[key][1]-1,formatted[key][2],
                    formatted[key][3],formatted[key][4],formatted[key][5]));
                };
              });
            }
            formatted.id = ok.id;
            formatted.rev = ok.rev;
            delete formatted._id;
            delete formatted._rev;
            return cb(err,formatted);
          });
        });
      }, coll[collectionName].config,cb);
    },

    // Find function uses autoView functionality if the query contains anything besides
    // the ID of the document. This is an expensive operation and is meant only for compatibility
    // with other Sails adapters.
    find: function(collectionName,options,cb){
      spawnClient(function(db,cb){
        if (options.where && options.where.id){
          db.getDoc(options.where.id,function(err,doc){
            cb(err,[doc]);
          })
        }
        else{
          utils.autoView(coll[collectionName].schema,options,db,function(err,models){
            cb(err,models);
          });
        }
      },coll[collectionName].config,cb);
    },

    // Searches for and updates models.
    update: function(collectionName, options, values, cb) {
      spawnClient(function(db,cb){
        var formatted = [];
        adapter.find(collectionName,options,function(err,models){
          async.forEach(models,function(model,callback){
            _.extend(model,values);
            utils.waterlineToCouch(model,coll[collectionName],db,function(err,result){
              formatted.push(result);
              callback(err);
            });
          },function(err){
            db.bulkDocs({"docs":formatted},function(err,ok){
              if (err) return cb(err);
              async.forEach(_.range(formatted.length),function(value,callback){
                formatted[value].id = ok[value].id;
                formatted[value].rev = ok[value].rev;
                delete formatted[value]._id;
                delete formatted[value]._rev;
                return callback();
              },function(err){
                if (err) return cb(err);
                return cb(err, models);
              });
            });
          });
        });
      },coll[collectionName].config,cb);
    },

    // TODO: Implement
    destroy: function(collectionName, options, cb) {
      spawnClient(function(db,cb){
        var formatted = [];
        adapter.find(collectionName,options,function(err,models){
          async.forEach(models,function(model,callback){
            db.removeDoc(model.id,model.rev,function(err,ok){
              callback(err,ok);
            });
          },function(err){
            return cb(err);
          });
        });
      },coll[collectionName].config,cb);
    },

    view: function(collectionName,options,cb){
      spawnClient(function(db,cb){
        db.view(options.design,options.view,options.query,function(err,data){
          return cb(err,data);
        });
      },coll[collectionName].config,cb);
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


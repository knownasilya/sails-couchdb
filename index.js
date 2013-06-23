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
  , utils = require('./utils');


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
        var def = _.clone(definition);
        var keys = Object.keys(def);
        var index = [];
        var options = {};
        options.where = {};

        async.waterfall([
          function(callback) {
            var requiredKeys = _.filter(Object.keys(def),function(key){
                return def[key].required
            });
            _.each(requiredKeys,function(value){
              options.where[value] = def[value];
            });
            coll[collectionName].schema = def;
            var view = utils.generateView(options,'sails_index');
            callback(null,view)
          }],
          function(err,view){
            utils.saveView(view,'sails_' + collectionName,db,function(err,data){
              if (err) return cb(err);
              return cb(err,data);
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
        async.each(Object.keys(coll[collectionName].schema),
          function(key,cb){
            var schema = coll[collectionName].schema;
            if (schema[key].required && !values[key]){
              return cb("Required field missing");
            }
            if (schema[key].autoIncrement !== true){
              return cb();
            };
            utils.getAutoIncrement(collectionName,key,db,function(err,value){
              if (err) return cb(err);
              values[key] = value;
              return cb();
            });
          },function(err){
            if (err) return cb(err);
            db.saveDoc(values,function(err,ok){
              if (err) return cb(err);
              values.id = ok.id;
              values.rev = ok.rev;
              return cb(err,values);
            })
          }
        );
      }, coll[collectionName].config,cb);
    },

    // Same as create(), but utilizes CouchDB's bulk update functionality.
    createEach: function(collectionName, values, cb){
      spawnClient(function(db,cb){
        db.bulkDocs({"docs":values},function(err,ok){
          if (err) return cb(err);
          utils.formatModelsCreate(values,ok,function(err,results){
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

    find: function(collectionName,options,cb){
      spawnClient(function(db,cb){
        utils.search(coll[collectionName].schema,options,db,function(err,models){
          cb(err,models);
        });
      },coll[collectionName].config,cb);
    },

    // TODO: Implement
    update: function(collectionName, options, values, cb) {
        spawnClient(function(db,cb){
        utils.search(coll[collectionName].schema,options,db,function(err,models){
          if (err) return cb(err);
          async.series([function(callback){
            _.each(models,function(model){
              model = _.extend(model,values);
              model._id = model.id;
              model._rev = model.rev;
              delete model.id;
              delete model.rev;
            })
            callback();
          }],
          function(err){
            db.bulkDocs({"docs":models},function(err,ok){
              if (err) return cb(err);
              utils.formatModelsCreate(models,ok,function(err,results){
                if (err) return cb(err);
                return cb(err,results);
              });
            });
          })
        });
      },coll[collectionName].config,cb);
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
var crypto = require('crypto')
  , async = require('async')
  , _ = require('underscore');

var viewCollection = {};

exports.search = function(schema,options,db,cb){
  async.waterfall([
    function(callback){
      var queryKey = JSON.stringify(Object.keys(options.where).sort());
      var hash = createHash(queryKey);
      var view = exports.generateView(options);
      exports.saveView(view,hash,db,function(err,ok){
        callback(err,hash);
      });
    },
    function(hash,callback){
      var query = generateQuery(options);
      db.view('sails_'+hash,hash,query,function(err,ok){
        callback(err,ok.rows,schema);
      });
    }],
    function(err,unformatted){
      if (err) return cb(err);
      var models = formatModelsFind(unformatted,schema);
      cb(null,models)
    }
  );
};

exports.saveView = function(view,hash,db,cb){
  var doc = {};
  doc.views = {};
  doc.views[hash]=view;
  var saved = false;

  if(!viewCollection[hash]){
    viewCollection[hash]=view;
  }
  db.saveDesign('sails_'+hash,doc,function(err,ok){
    return cb();
  });
};

// Generates a view object to be passed to saveView();
exports.generateView = function(options){
  var mapFunc = "function(doc){if(REQUIRED){emit(EMITTED,doc);}}";
  var view = {};
  var required = "doc";
  var emitted = "[";
  _.each(Object.keys(options.where), function(key){
    required = required + " && doc." + key;
    emitted = emitted + "doc." + key + ",";
  });
  emitted = emitted.replace(/,$/,"") + "]";
  mapFunc = mapFunc.replace("REQUIRED",required).replace("EMITTED",emitted).replace(/ +?/g, '');
  view.map = mapFunc;
  return view;
};

// Formats the models returned by CouchDB into a format that waterline accepts.


// Shim for createEach() to format the models into a form that waterline accepts.
exports.formatModelsCreate = function(models,results,cb){
  async.series([function(cb){
    _.each(_.range(models.length),function(value){
      models[value].id = results[value].id;
      models[value].rev = results[value].rev;
      delete models[value]._id;
      delete models[value]._rev;
    });
    return cb();
  }],function(err){
    if (err) return cb(err);
    return cb(err, models);
  });
};

// Utility function for creating a hash key. Used for indexing views in a design document.

exports.getAutoIncrement = function(collectionName,key,db,cb){
  var docName = 'sails_' + collectionName+"_autoIncrement_"+key;
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

var createHash = function(data){
  var sha256Hash;
  sha256Hash = crypto.createHash('sha256');
  sha256Hash.update(data);
  viewName = sha256Hash.digest('hex');
  return viewName;
};

var generateQuery = function(options){
  var query = {include_docs:true};
  query.startkey = [];
  query.endkey = [];
  if (options.limit) query.limit = options.limit;
  _.each(Object.keys(options.where), function(key){
    query.startkey.push(options.where[key]);
  });
  query.endkey = query.startkey;
  return query;
};

var formatModelsFind = function(models,schema){
  var results = [];
  _.each(Object.keys(schema),function(key){
    if (typeof schema[key] === 'function'){
      _.each(models,function(model){
          model[key] = schema[key];
      });
    }
  });
  _.each(models,function(model){
    var result = model.value;
    result.id = result._id;
    delete result._id;
    result.rev = result._rev;
    delete result._rev;
    results.push(result);
  });
  return results;
};
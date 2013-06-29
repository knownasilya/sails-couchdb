var crypto = require('crypto')
  , async = require('async')
  , _ = require('underscore');

// Maintains our automatically generated views
var viewCollection = {};


// Converts a Waterline model to Couch. Allows for datesAsArray conversion
exports.waterlineToCouch = function(values,collection,db,cb){
  var schema = collection.schema;
  async.forEach(Object.keys(schema),
  function(key,callback){
    if (!values[key]){
      return callback();
    }
    else if (schema[key].required){
      return callback("Required field missing");
    }
    else if (schema[key].type === 'date'){
      var date = new Date(values[key]).toISOString().split("T");
      date = date[0].split("-").concat(date[1].split(":"));
      for (var i = 0; i < date.length; ++i){
        date[i] = parseInt(date[i]);
      }
      values[key] = date;
      return callback();
    }
    else if (schema[key].autoIncrement === true && key != "id"){
      exports.getAutoIncrement(collection.identity,key,db,function(err,value){
        if (err) return callback(err);
        values[key] = value;
        return callback();
      });
    }
    else{
      return callback();
    }
  },function(err){
    if (values.id && values.rev){
          values._id = values.id.toString();
    values._rev = values.rev.toString();
    delete values.id;
    delete values.rev;
    }

    return cb(err,values);
  });
};

// Searches based on automatically-generated views
exports.autoView = function(schema,options,db,cb){
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
      var query = waterlineToCouchQuery(options);
      db.view('sails_'+hash,hash,query,function(err,ok){
        callback(err,ok.rows);
      });
    }],
    function(err,unformatted){
      if (err) return cb(err);
      var models = couchToWaterline(unformatted,schema);
      cb(null,models)
    }
  );
};

// Saves a view to CouchDB using a hash based on the query.
// Meant for autoView
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

// Utility for autoIncrement functionality.
exports.getAutoIncrement = function(collectionName,key,db,cb){
  var docName = 'sails_autoIncrement_' + collectionName+"_autoIncrement_"+key;
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
      if (err && err.error === "conflict") return exports.getAutoIncrement(collectionName,key,db,cb);
      return cb(err,values[key]);
    });
  });
};

// Creates a hash for use in autoView generation
var createHash = function(data){
  var sha256Hash;
  sha256Hash = crypto.createHash('sha256');
  sha256Hash.update(data);
  viewName = sha256Hash.digest('hex');
  return viewName;
};

// Converts a Waterline query to CouchDB.
var waterlineToCouchQuery = function(options){
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

// Converts Couch to Waterline Model
var couchToWaterline = function(models,schema){
  var results = [];
  _.each(Object.keys(schema),function(key){
    if (typeof schema[key] === 'function'){
      _.each(models,function(model){
          model[key] = schema[key];
      });
    }else if (schema[key].type === 'date'){
      _.each(models,function(model){
        if (model.doc[key]){
          model.doc[key] = new Date(Date.UTC(model.doc[key][0],model.doc[key][1]-1,model.doc[key][2],
          model.doc[key][3],model.doc[key][4],model.doc[key][5]));
        }
      });
    }
  });
  _.each(models,function(model){
    var result = model.doc;
    result.id = result._id;
    delete result._id;
    result.rev = result._rev;
    delete result._rev;
    result.createdAt = new Date(result.createdAt);
    result.updatedAt = new Date(result.updatedAt);
    results.push(result);
  });
  return results;
};
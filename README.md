sails-couchdb: A CouchDB adapter for Sails.js
=============================================

Overview
--------

This is a CouchDB adapter for Sails.js.

Configuration
-------------
    adapter.config:{
      host:"localhost",
      port:5984,
      database:"database"
    }

CRUD
----

This adapter allows for the basic CRUD operations required for a Sails adapter. However, it does not support must of the Query modifiers. See the tests below for verification.

This support is facilitated by automatically generating views for your Find queries. This means that it is slow the first time running, but subsequently fast. I would not recommend leveraging auto-view for production, as creating on-the-fly views means building a new B-tree. However, for development, it is VERY useful, as it can show you what sort of map/reduce functions you should need to implement in your final product.

Dates stored as array
---------------------

All date objects passed to the adapter will store them as an array for easier range querying.

Views
-----

A custom function included is the "view" function:

    options = {
      design: "designDoc",
      view: "viewName",
      query: {
      	group:true,
      	startkey:"start",
      	endkey:"end"
      }
    };

    Model.view(options,callback(err,models){
      // Do stuff with models;
    });

Tests
-----

This project is ongoing. I will be running integration tests as I implement more of the adapter.

This adapter was tested with [waterline-adapter-tests](https://github.com/balderdash/waterline-adapter-tests).

Here are the failures of the current test suite:

PASS Collection .createEach(FAIL should create a set of users: 11ms

PASS Collection .createEach(FAIL should insert 2 records verififed by find: 18ms

PASS Collection .createEach(FAIL should return model instances: 8ms

PASS Collection .create(FAIL should create a new record: 5ms

PASS Collection .create(FAIL should return a generated PK: 4ms

PASS Collection .create(FAIL should return generated timestamps: 5ms

PASS Collection .create(FAIL should return a model instance: 4ms

PASS Collection .create(FAIL overloaded usage of create should have saved the proper values (with auto-increment valuesFAIL: 19ms

PASS Collection Schema primaryKey should disable autoPK: 0ms

PASS Collection Schema primaryKey should set attribute as primary key: 0ms

PASS Collection Schema autoIncrement should set autoIncrement on schema attribute: 0ms

FAIL Collection Schema autoIncrement should increment an ID on insert

PASS Collection Schema uniqueness should set unique on schema attribute: 0ms

FAIL Collection Schema uniqueness should return an error if unique constraint fails

PASS Collection .findOrCreate(FAIL should create a new record: 26ms

PASS Collection .findOrCreate(FAIL should return a single record: 18ms

PASS Collection .findOrCreate(FAIL should only have a single record in the database: 9ms

PASS Collection .findOrCreate(FAIL should return a model instance: 12ms

PASS Collection definitions autoCreatedAt should be on by default: 0ms

PASS Collection definitions autoCreatedAt should cause new schema to have a createdAt attribute: 0ms

PASS Collection definitions autoUpdatedAt should be on by default: 0ms

PASS Collection definitions autoUpdatedAt should cause new schema to have an updatedAt attribute: 0ms

PASS Collection definitions autoPK should be set to use id by default: 0ms

PASS Collection definitions autoPK should cause new schema to have an id attribute: 0ms

PASS Collection .findOne(FAIL should return a single record: 13ms

PASS Collection .findOne(FAIL should return a model instance: 7ms

PASS Collection .findOne(FAIL should return null if a record is not found: 8ms

PASS Collection .findOne(FAIL should work with just an id passed in: 4ms

FAIL Collection .findOne(FAIL should work with no criteria passed in

PASS Collection .findOrCreateEach(FAIL should create new user(sFAIL for the one that doesn't exist: 11ms

PASS Collection .findOrCreateEach(FAIL should find a user that does exist: 9ms

PASS Collection .findOrCreateEach(FAIL should only have a single record for keys that exist: 12ms

PASS Collection .findOrCreateEach(FAIL should fail when only one arg is specified: 0ms

PASS Collection .findOrCreateEach(FAIL should return model instances: 14ms

PASS Attribute Types String with valid data should store proper string value: 3ms

PASS Attribute Types Float with valid data should store proper float value: 6ms

PASS Attribute Types Date with valid data should store proper date value: 3ms

PASS Attribute Types Integer with valid data should store proper integer: 2ms

PASS Attribute Types Boolean with valid data should store proper boolean value: 4ms

PASS Attribute Types Array with valid data should store proper array value: 9ms

PASS Collection .update(FAIL attributes should return model instances: 31ms

PASS Collection .update(FAIL attributes should work with just an ID passed in: 12ms

PASS Collection .update(FAIL find updated records should allow the record to be found: 16ms

PASS Collection .destroy(FAIL a single record should destroy a record: 25ms

PASS Collection .destroy(FAIL a single record should return an empty array when searched for: 14ms

FAIL Collection .destroy(FAIL multiple records should destroy all the records

PASS Collection .destroy(FAIL multiple records should return an empty array when searched for: 15ms

PASS Collection .find(FAIL should return 10 records: 16ms

PASS Collection .find(FAIL should return 1 record when searching for a specific record (integer testFAIL with find: 28ms

FAIL Collection .find(FAIL should return 1 record when searching for a specific record (integer testFAIL with find

PASS Collection .find(FAIL should return a model instance: 13ms

FAIL Collection .find(FAIL should work with no criteria passed in

FAIL Query Modifiers endsWith shorthand should return the user with the correct name

FAIL Query Modifiers endsWith full where criteria should return the user with the correct name

FAIL Query Modifiers endsWith dynamic attribute should have [attribute]EndsWith(FAIL method

FAIL Query Modifiers lessThan (<FAIL should return records with lessThan key

FAIL Query Modifiers lessThan (<FAIL should return records with symbolic usage < usage

FAIL Query Modifiers lessThanOrEqual (<=FAIL should return records with lessThanOrEqual key

FAIL Query Modifiers lessThanOrEqual (<=FAIL should return records with symbolic usage <= usage

FAIL Query Modifiers greaterThan (>FAIL should return records with greaterThan key

FAIL Query Modifiers greaterThan (>FAIL should return records with symbolic usage > usage

FAIL Query Modifiers greaterThanOrEqual (>=FAIL should return records with greaterThanOrEqual key

FAIL Query Modifiers greaterThanOrEqual (>=FAIL should return records with symbolic usage >= usage

FAIL Query OR Query Modifier with a record should return the correct users

FAIL Query OR Query Modifier with a record should return a model instances

PASS Query OR Query Modifier without a record should return an empty array: 7ms

PASS Query LIMIT Query Modifier should return the correct amount of records: 23ms

PASS Query LIMIT Query Modifier dynamic finder usage should return the correct amount of records: 6ms

PASS Query LIMIT Query Modifier as an option should return correct amount of records: 11ms

FAIL Query Modifiers startsWith shorthand should return the user with the correct name

FAIL Query Modifiers startsWith full where criteria should return the user with the correct name

FAIL Query Modifiers startsWith dynamic attribute should have [attribute]StartsWith(FAIL method

FAIL Query Modifiers LIKE should return the user with the given name

FAIL Query Modifiers LIKE should support wrapping both sides with a % sign

FAIL Query Modifiers contains shorthand should return the user with the correct name

FAIL Query Modifiers contains full where criteria should return the user with the correct name

FAIL Query Modifiers contains dynamic attribute should have [attribute]contains(FAIL method

FAIL Query Modifiers not (!FAIL should return records with string usage

FAIL Query Modifiers not (!FAIL should return records with symbolic usage ! usage

FAIL Query IN Query Modifier with a record should return correct user

FAIL Query IN Query Modifier with a record should return a model instance

PASS Query IN Query Modifier without a record should return an empty array: 8ms

FAIL Query SKIP Query Modifier should return the correct amount of records

FAIL Query SKIP Query Modifier dynamic finder usage should return the correct amount of records

FAIL Query SKIP Query Modifier as an option should return correct amount of records

PASS Query SORT Query Modifier should sort records using binary notation for asc: 24ms

FAIL Query SORT Query Modifier should sort records using binary notation desc

PASS Query SORT Query Modifier should sort records using string notation for asc: 13ms

FAIL Query SORT Query Modifier should sort records using string notation for desc

FAIL Query SORT Query Modifier should sort when sort is an option

FAIL Query case sensitivity .findOne(FAIL should work in a case insensitve fashion by default

FAIL Query case sensitivity .findOne(FAIL should work with findOneBy*(FAIL

FAIL Query case sensitivity .find(FAIL should work in a case insensitve fashion by default

FAIL Query case sensitivity .find(FAIL should work with findBy*(FAIL

FAIL Query case sensitivity special classified queries contains should work in a case insensitive fashion by default

FAIL Query case sensitivity special classified queries startsWith should work in a case insensitive fashion by default

FAIL Query case sensitivity special classified queries endsWith should work in a case insensitive fashion by default

FAIL Query case sensitivity special classified queries like should work in a case insensitive fashion by default

FAIL Query case sensitivity special classified queries endsWith should actually enforce endswith

FAIL Query .findOneLike(FAIL should return the user with the given name


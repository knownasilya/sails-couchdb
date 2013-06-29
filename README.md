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
      database:"database",
      datesAsArray: true
    }

CRUD
----

This adapter allows for the basic CRUD operations required for a Sails adapter. However, it does not support must of the Query modifiers. See the tests below for verification.

This support is facilitated by automatically generating views for your Find queries. This means that it is slow the first time running, but subsequently fast. I would not recommend leveraging auto-view for production, as creating on-the-fly views means building a new B-tree. However, for development, it is VERY useful, as it can show you what sort of map/reduce functions you should need to implement in your final product.

datesAsArray
------------

You can pass the datesAsArray option to the adapter to store any 'date' fields in your model as an array in CouchDB. This is for those who would like to do easier range queries on dates. This is currently not supported for the createdAt and updatedAt timestamps.

Views
-----

Soon to be added: custom functionality to create and query views directly.

Tests
-----

This project is ongoing. I will be running integration tests as I implement more of the adapter.

This adapter was tested with [waterline-adapter-tests](https://github.com/balderdash/waterline-adapter-tests).

Here are the failures of the current test suite. Working on customizing the reporting so it looks cleaner:

PASS Collection .createEach() should create a set of users: 8ms

PASS Collection .createEach() should insert 2 records verififed by find: 17ms

PASS Collection .createEach() should return model instances: 4ms

PASS Collection .create() should create a new record: 2ms

PASS Collection .create() should return a generated PK: 3ms

PASS Collection .create() should return generated timestamps: 3ms

PASS Collection .create() should return a model instance: 2ms

PASS Collection .create() overloaded usage of create should have saved the proper values (with auto-increment values): 21ms

PASS Collection Schema primaryKey should disable autoPK: 0ms

PASS Collection Schema primaryKey should set attribute as primary key: 0ms

PASS Collection Schema autoIncrement should set autoIncrement on schema attribute: 0ms

FAIL Collection Schema autoIncrement should increment an ID on insert

PASS Collection Schema uniqueness should set unique on schema attribute: 0ms

FAIL Collection Schema uniqueness should return an error if unique constraint fails

PASS Collection .findOrCreate() should create a new record: 22ms

PASS Collection .findOrCreate() should return a single record: 17ms

PASS Collection .findOrCreate() should only have a single record in the database: 6ms

PASS Collection .findOrCreate() should return a model instance: 6ms

PASS Collection definitions autoCreatedAt should be on by default: 0ms

PASS Collection definitions autoCreatedAt should cause new schema to have a createdAt attribute: 0ms

PASS Collection definitions autoUpdatedAt should be on by default: 0ms

PASS Collection definitions autoUpdatedAt should cause new schema to have an updatedAt attribute: 0ms

PASS Collection definitions autoPK should be set to use id by default: 0ms

PASS Collection definitions autoPK should cause new schema to have an id attribute: 0ms

PASS Collection .findOne() should return a single record: 12ms

PASS Collection .findOne() should return a model instance: 3ms

PASS Collection .findOne() should return null if a record is not found: 5ms

PASS Collection .findOne() should work with just an id passed in: 3ms

FAIL Collection .findOne() should work with no criteria passed in

PASS Collection .findOrCreateEach() should create new user(s) for the one that doesn't exist: 25ms

PASS Collection .findOrCreateEach() should find a user that does exist: 15ms

PASS Collection .findOrCreateEach() should only have a single record for keys that exist: 24ms

PASS Collection .findOrCreateEach() should fail when only one arg is specified: 0ms

PASS Collection .findOrCreateEach() should return model instances: 9ms

PASS Attribute Types String with valid data should store proper string value: 5ms

PASS Attribute Types Float with valid data should store proper float value: 6ms

PASS Attribute Types Date with valid data should store proper date value: 7ms

PASS Attribute Types Integer with valid data should store proper integer: 5ms

PASS Attribute Types Boolean with valid data should store proper boolean value: 6ms

PASS Attribute Types Array with valid data should store proper array value: 6ms

PASS Collection .update() attributes should return model instances: 1511ms

PASS Collection .update() attributes should work with just an ID passed in: 9ms

FAIL Collection .update() find updated records should allow the record to be found

PASS Collection .destroy() a single record should destroy a record: 1ms

FAIL Collection .destroy() a single record should return an empty array when searched for

PASS Collection .destroy() multiple records should destroy all the records: 1ms

FAIL Collection .destroy() multiple records should return an empty array when searched for

PASS Collection .find() should return 10 records: 13ms

PASS Collection .find() should return 1 record when searching for a specific record (integer test) with find: 30ms

FAIL Collection .find() should return 1 record when searching for a specific record (integer test) with find

PASS Collection .find() should return a model instance: 10ms

FAIL Collection .find() should work with no criteria passed in

FAIL Query Modifiers endsWith shorthand should return the user with the correct name

FAIL Query Modifiers endsWith full where criteria should return the user with the correct name

FAIL Query Modifiers endsWith dynamic attribute should have [attribute]EndsWith() method

FAIL Query Modifiers lessThan (<) should return records with lessThan key

FAIL Query Modifiers lessThan (<) should return records with symbolic usage < usage

FAIL Query Modifiers lessThanOrEqual (<=) should return records with lessThanOrEqual key

FAIL Query Modifiers lessThanOrEqual (<=) should return records with symbolic usage <= usage

FAIL Query Modifiers greaterThan (>) should return records with greaterThan key

FAIL Query Modifiers greaterThan (>) should return records with symbolic usage > usage

FAIL Query Modifiers greaterThanOrEqual (>=) should return records with greaterThanOrEqual key

FAIL Query Modifiers greaterThanOrEqual (>=) should return records with symbolic usage >= usage

FAIL Query OR Query Modifier with a record should return the correct users

FAIL Query OR Query Modifier with a record should return a model instances

PASS Query OR Query Modifier without a record should return an empty array: 7ms

PASS Query LIMIT Query Modifier should return the correct amount of records: 14ms

PASS Query LIMIT Query Modifier dynamic finder usage should return the correct amount of records: 3ms

PASS Query LIMIT Query Modifier as an option should return correct amount of records: 4ms

FAIL Query Modifiers startsWith shorthand should return the user with the correct name

FAIL Query Modifiers startsWith full where criteria should return the user with the correct name

FAIL Query Modifiers startsWith dynamic attribute should have [attribute]StartsWith() method

FAIL Query Modifiers LIKE should return the user with the given name

FAIL Query Modifiers LIKE should support wrapping both sides with a % sign

FAIL Query Modifiers contains shorthand should return the user with the correct name

FAIL Query Modifiers contains full where criteria should return the user with the correct name

FAIL Query Modifiers contains dynamic attribute should have [attribute]contains() method

FAIL Query Modifiers not (!) should return records with string usage

FAIL Query Modifiers not (!) should return records with symbolic usage ! usage

FAIL Query IN Query Modifier with a record should return correct user

FAIL Query IN Query Modifier with a record should return a model instance

PASS Query IN Query Modifier without a record should return an empty array: 9ms

FAIL Query SKIP Query Modifier should return the correct amount of records

FAIL Query SKIP Query Modifier dynamic finder usage should return the correct amount of records

FAIL Query SKIP Query Modifier as an option should return correct amount of records

PASS Query SORT Query Modifier should sort records using binary notation for asc: 25ms

FAIL Query SORT Query Modifier should sort records using binary notation desc

PASS Query SORT Query Modifier should sort records using string notation for asc: 16ms

FAIL Query SORT Query Modifier should sort records using string notation for desc

FAIL Query SORT Query Modifier should sort when sort is an option

FAIL Query case sensitivity .findOne() should work in a case insensitve fashion by default

FAIL Query case sensitivity .findOne() should work with findOneBy*()

FAIL Query case sensitivity .find() should work in a case insensitve fashion by default

FAIL Query case sensitivity .find() should work with findBy*()

FAIL Query case sensitivity special classified queries contains should work in a case insensitive fashion by default

FAIL Query case sensitivity special classified queries startsWith should work in a case insensitive fashion by default

FAIL Query case sensitivity special classified queries endsWith should work in a case insensitive fashion by default

FAIL Query case sensitivity special classified queries like should work in a case insensitive fashion by default

FAIL Query case sensitivity special classified queries endsWith should actually enforce endswith

FAIL Query .findOneLike() should return the user with the given name

PASS Query count() should accurately count records: 33ms

PASS Query count() should work with dynamic finders: 6ms

FAIL Query .findLike() should return all the users with the given name

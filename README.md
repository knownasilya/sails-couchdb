sails-couchdb: A CouchDB adapter for Sails.js
=============================================

Overview
--------

This is a CouchDB adapter for Sails.js. I took extra care to include the usual CRUD stuff that SQL users are used to. However, there are a number of caveats that should be kept in mind when designing an application to use CouchDB.

If you have any questions, I am on freenode IRC, #crave.

Caveats
-------

CouchDB works by creating "views", which are B-trees using map-reduce functionality to provide an index with rolling updates. This means a few things:

* The initial query for an index is expensive, as a B-tree must be build to maintain that index.
* Subsequent queries are small, as it is updating the B-tree in approx O(logn) time.
* Querying within a view is limited to key ranges.

Design choices for this adapter were tough, so let me outline what I have so far:

* find() works by creating a view for the index being queried. This means the first time a query runs, it is slow, but subsequent queries are fast. This also means the more number of queries, the more B-trees, and by consequence the more memory you would use.
* There is no drop() functionality. This will be emulated by simply deleting a view.
* It is not possible to do a bulk delete with CouchDB. I might simulate this functionality, but keep in mind the simulated function would be slow as all hell.

Tests
-----

This project is ongoing. I will be running integration tests as I implement more of the adapter.

This adapter was tested with [waterline-adapter-tests](https://github.com/balderdash/waterline-adapter-tests).

Here are the results of the current test suite:

<a name="collection"></a>
# Collection
<a name="collection-createeach"></a>
## .createEach()
* should create a set of users. - PASSED 
* should insert 2 records verififed by find. - PASSED 
* should return model instances. - PASSED 
<a name="collection"></a>
# Collection
<a name="collection-create"></a>
## .create()
* should create a new record. - PASSED 
* should return a generated PK. - PASSED 
* should return generated timestamps. - PASSED 
* should return a model instance. - PASSED 
<a name="collection-create-overloaded-usage-of-create"></a>
### overloaded usage of create
* should have saved the proper values (with auto-increment values). - PASSED 
<a name="collection"></a>
# Collection
<a name="collection-schema"></a>
## Schema
<a name="collection-schema-primarykey"></a>
### primaryKey
* should disable autoPK. - PASSED 
* should set attribute as primary key. - PASSED 
<a name="collection-schema-autoincrement"></a>
### autoIncrement
* should set autoIncrement on schema attribute. - PASSED 
* should increment an ID on insert. - PASSED 
<a name="collection-schema-uniqueness"></a>
### uniqueness
* should set unique on schema attribute. - PASSED 
* should return an error if unique constraint fails. - FAILED 
<a name="collection"></a>
# Collection
<a name="collection-findorcreate"></a>
## .findOrCreate()
* should create a new record. - PASSED 
* should return a single record. - PASSED 
* should only have a single record in the database. - PASSED 
* should return a model instance. - PASSED 
<a name="collection"></a>
# Collection
<a name="collection-definitions"></a>
## definitions
<a name="collection-definitions-autocreatedat"></a>
### autoCreatedAt
* should be on by default. - PASSED 
* should cause new schema to have a createdAt attribute. - PASSED 
<a name="collection-definitions-autoupdatedat"></a>
### autoUpdatedAt
* should be on by default. - PASSED 
* should cause new schema to have an updatedAt attribute. - PASSED 
<a name="collection-definitions-autopk"></a>
### autoPK
* should be set to use id by default. - PASSED 
* should cause new schema to have an id attribute. - PASSED 
<a name="collection"></a>
# Collection
<a name="collection-findone"></a>
## .findOne()
* should return a single record. - PASSED 
* should return a model instance. - FAILED 
* should return null if a record is not found. - PASSED 
* should work with just an id passed in. - FAILED 
* should work with no criteria passed in. - FAILED 
<a name="collection"></a>
# Collection
<a name="collection-findorcreateeach"></a>
## .findOrCreateEach()
* should create new user(s) for the one that doesn't exist. - PASSED 
* should find a user that does exist. - PASSED 
* should only have a single record for keys that exist. - PASSED 
* should fail when only one arg is specified. - PASSED 
* should return model instances. - FAILED 
<a name="attribute-types"></a>
# Attribute Types
<a name="attribute-types-string"></a>
## String
<a name="attribute-types-string-with-valid-data"></a>
### with valid data
* should store proper string value. - PASSED 
<a name="attribute-types"></a>
# Attribute Types
<a name="attribute-types-float"></a>
## Float
<a name="attribute-types-float-with-valid-data"></a>
### with valid data
* should store proper float value. - PASSED 
<a name="attribute-types"></a>
# Attribute Types
<a name="attribute-types-date"></a>
## Date
<a name="attribute-types-date-with-valid-data"></a>
### with valid data
* should store proper date value. - PASSED 
<a name="attribute-types"></a>
# Attribute Types
<a name="attribute-types-integer"></a>
## Integer
<a name="attribute-types-integer-with-valid-data"></a>
### with valid data
* should store proper integer. - PASSED 
<a name="attribute-types"></a>
# Attribute Types
<a name="attribute-types-boolean"></a>
## Boolean
<a name="attribute-types-boolean-with-valid-data"></a>
### with valid data
* should store proper boolean value. - PASSED 
<a name="attribute-types"></a>
# Attribute Types
<a name="attribute-types-array"></a>
## Array
<a name="attribute-types-array-with-valid-data"></a>
### with valid data
* should store proper array value. - PASSED 
<a name="collection"></a>
# Collection
<a name="collection-update"></a>
## .update()
<a name="collection-update-attributes"></a>
### attributes
* should update model attributes. - FAILED 
* should return model instances. - FAILED 
* should work with just an ID passed in. - FAILED 
<a name="collection-update-find-updated-records"></a>
### find updated records
* should allow the record to be found. - FAILED 
<a name="collection"></a>
# Collection
<a name="collection-destroy"></a>
## .destroy()
<a name="collection-destroy-a-single-record"></a>
### a single record
* should destroy a record. - PASSED 
* should return an empty array when searched for. - FAILED 
<a name="collection-destroy-multiple-records"></a>
### multiple records
* should destroy all the records. - PASSED 
* should return an empty array when searched for. - FAILED 
<a name="collection"></a>
# Collection
<a name="collection-find"></a>
## .find()
* should return 10 records. - PASSED 
* should return 1 record when searching for a specific record (integer test) with find. - PASSED 
* should return 1 record when searching for a specific record (integer test) with find. - FAILED 
* should return a model instance. - FAILED 
* should work with no criteria passed in. - FAILED 
<a name="query"></a>
# Query
<a name="query-modifiers"></a>
## Modifiers
<a name="query-modifiers-endswith"></a>
### endsWith
<a name="query-modifiers-endswith-shorthand"></a>
#### shorthand
* should return the user with the correct name. - FAILED 
<a name="query-modifiers-endswith-full-where-criteria"></a>
#### full where criteria
* should return the user with the correct name. - FAILED 
<a name="query-modifiers-endswith-dynamic-attribute"></a>
#### dynamic attribute
* should have [attribute]EndsWith() method. - FAILED 
<a name="query"></a>
# Query
<a name="query-modifiers"></a>
## Modifiers
<a name="query-modifiers-lessthan-"></a>
### lessThan (<)
* should return records with lessThan key. - FAILED 
* should return records with symbolic usage < usage. - FAILED 
<a name="query-modifiers-lessthanorequal-"></a>
### lessThanOrEqual (<=)
* should return records with lessThanOrEqual key. - FAILED 
* should return records with symbolic usage <= usage. - FAILED 
<a name="query"></a>
# Query
<a name="query-modifiers"></a>
## Modifiers
<a name="query-modifiers-greaterthan-"></a>
### greaterThan (>)
* should return records with greaterThan key. - FAILED 
* should return records with symbolic usage > usage. - FAILED 
<a name="query-modifiers-greaterthanorequal-"></a>
### greaterThanOrEqual (>=)
* should return records with greaterThanOrEqual key. - FAILED 
* should return records with symbolic usage >= usage. - FAILED 
<a name="query"></a>
# Query
<a name="query-or-query-modifier"></a>
## OR Query Modifier
<a name="query-or-query-modifier-with-a-record"></a>
### with a record
* should return the correct users. - FAILED 
* should return a model instances. - FAILED 
<a name="query-or-query-modifier-without-a-record"></a>
### without a record
* should return an empty array. - PASSED 
<a name="query"></a>
# Query
<a name="query-limit-query-modifier"></a>
## LIMIT Query Modifier
* should return the correct amount of records. - PASSED 
* dynamic finder usage should return the correct amount of records. - PASSED 
* as an option should return correct amount of records. - PASSED 
<a name="query"></a>
# Query
<a name="query-modifiers"></a>
## Modifiers
<a name="query-modifiers-startswith"></a>
### startsWith
<a name="query-modifiers-startswith-shorthand"></a>
#### shorthand
* should return the user with the correct name. - FAILED 
<a name="query-modifiers-startswith-full-where-criteria"></a>
#### full where criteria
* should return the user with the correct name. - FAILED 
<a name="query-modifiers-startswith-dynamic-attribute"></a>
#### dynamic attribute
* should have [attribute]StartsWith() method. - FAILED 
<a name="query"></a>
# Query
<a name="query-modifiers"></a>
## Modifiers
<a name="query-modifiers-like"></a>
### LIKE
* should return the user with the given name. - FAILED 
* should support wrapping both sides with a % sign. - FAILED 
<a name="query"></a>
# Query
<a name="query-modifiers"></a>
## Modifiers
<a name="query-modifiers-contains"></a>
### contains
<a name="query-modifiers-contains-shorthand"></a>
#### shorthand
* should return the user with the correct name. - FAILED 
<a name="query-modifiers-contains-full-where-criteria"></a>
#### full where criteria
* should return the user with the correct name. - FAILED 
<a name="query-modifiers-contains-dynamic-attribute"></a>
#### dynamic attribute
* should have [attribute]contains() method. - FAILED 
<a name="query"></a>
# Query
<a name="query-modifiers"></a>
## Modifiers
<a name="query-modifiers-not-"></a>
### not (!)
* should return records with string usage. - FAILED 
* should return records with symbolic usage ! usage. - FAILED 
<a name="query"></a>
# Query
<a name="query-in-query-modifier"></a>
## IN Query Modifier
<a name="query-in-query-modifier-with-a-record"></a>
### with a record
* should return correct user. - FAILED 
* should return a model instance. - FAILED 
<a name="query-in-query-modifier-without-a-record"></a>
### without a record
* should return an empty array. - PASSED 
<a name="query"></a>
# Query
<a name="query-skip-query-modifier"></a>
## SKIP Query Modifier
* should return the correct amount of records. - FAILED 
* dynamic finder usage should return the correct amount of records. - FAILED 
* as an option should return correct amount of records. - FAILED 
<a name="query"></a>
# Query
<a name="query-sort-query-modifier"></a>
## SORT Query Modifier
* should sort records using binary notation for asc. - PASSED 
* should sort records using binary notation desc. - FAILED 
* should sort records using string notation for asc. - PASSED 
* should sort records using string notation for desc. - FAILED 
* should sort when sort is an option. - FAILED 
<a name="query"></a>
# Query
<a name="query-case-sensitivity"></a>
## case sensitivity
<a name="query-case-sensitivity-findone"></a>
### .findOne()
* should work in a case insensitve fashion by default. - FAILED 
* should work with findOneBy*(). - FAILED 
<a name="query-case-sensitivity-find"></a>
### .find()
* should work in a case insensitve fashion by default. - FAILED 
* should work with findBy*(). - FAILED 
<a name="query-case-sensitivity-special-classified-queries"></a>
### special classified queries
* contains should work in a case insensitive fashion by default. - FAILED 
* startsWith should work in a case insensitive fashion by default. - FAILED 
* endsWith should work in a case insensitive fashion by default. - FAILED 
* like should work in a case insensitive fashion by default. - FAILED 
* endsWith should actually enforce endswith. - FAILED 
<a name="query"></a>
# Query
<a name="query-findonelike"></a>
## .findOneLike()
* should return the user with the given name. - FAILED 
<a name="query"></a>
# Query
<a name="query-count"></a>
## count()
* should accurately count records. - PASSED 
* should work with dynamic finders. - PASSED 
<a name="query"></a>
# Query
<a name="query-findlike"></a>
## .findLike()
* should return all the users with the given name. - FAILED 

sails-couchdb: A CouchDB adapter for Sails.js
=============================================

Overview
--------

This is a CouchDB adapter for Sails.js. I took extra care to include the usual CRUD stuff that SQL users are used to. However, there are a number of caveats that should be kept in mind when designing an application to use CouchDB.

If you have any questions, I am on freenode IRC, #crave.

Tests
-----

This project is ongoing. I will be running integration tests as I implement more of the adapter.

This adapter was tested with [waterline-adapter-tests](https://github.com/balderdash/waterline-adapter-tests).

Here are the failures of the current test suite. Working on customizing the reporting so it looks cleaner:
 
# Collection
## .createEach()
# Collection
## .create()
### overloaded usage of create
# Collection
## Schema
### primaryKey
### autoIncrement
### uniqueness
* should return an error if unique constraint fails. - FAILED 
# Collection
## .findOrCreate()
# Collection
## definitions
### autoCreatedAt
### autoUpdatedAt
### autoPK
# Collection
## .findOne()
* should return a model instance. - FAILED 
* should work with just an id passed in. - FAILED 
* should work with no criteria passed in. - FAILED 
# Collection
## .findOrCreateEach()
* should return model instances. - FAILED 
# Attribute Types
## String
### with valid data
# Attribute Types
## Float
### with valid data
# Attribute Types
## Date
### with valid data
# Attribute Types
## Integer
### with valid data
# Attribute Types
## Boolean
### with valid data
# Attribute Types
## Array
### with valid data
# Collection
## .update()
### attributes
* should return model instances. - FAILED 
* should work with just an ID passed in. - FAILED 
### find updated records
# Collection
## .destroy()
### a single record
* should return an empty array when searched for. - FAILED 
### multiple records
* should return an empty array when searched for. - FAILED 
# Collection
## .find()
* should return 1 record when searching for a specific record (integer test) with find. - FAILED 
* should return a model instance. - FAILED 
* should work with no criteria passed in. - FAILED 
# Query
## Modifiers
### endsWith
#### shorthand
* should return the user with the correct name. - FAILED 
#### full where criteria
* should return the user with the correct name. - FAILED 
#### dynamic attribute
* should have [attribute]EndsWith() method. - FAILED 
# Query
## Modifiers
### lessThan (<)
* should return records with lessThan key. - FAILED 
* should return records with symbolic usage < usage. - FAILED 
### lessThanOrEqual (<=)
* should return records with lessThanOrEqual key. - FAILED 
* should return records with symbolic usage <= usage. - FAILED 
# Query
## Modifiers
### greaterThan (>)
* should return records with greaterThan key. - FAILED 
* should return records with symbolic usage > usage. - FAILED 
### greaterThanOrEqual (>=)
* should return records with greaterThanOrEqual key. - FAILED 
* should return records with symbolic usage >= usage. - FAILED 
# Query
## OR Query Modifier
### with a record
* should return the correct users. - FAILED 
* should return a model instances. - FAILED 
### without a record
# Query
## LIMIT Query Modifier
# Query
## Modifiers
### startsWith
#### shorthand
* should return the user with the correct name. - FAILED 
#### full where criteria
* should return the user with the correct name. - FAILED 
#### dynamic attribute
* should have [attribute]StartsWith() method. - FAILED 
# Query
## Modifiers
### LIKE
* should return the user with the given name. - FAILED 
* should support wrapping both sides with a % sign. - FAILED 
# Query
## Modifiers
### contains
#### shorthand
* should return the user with the correct name. - FAILED 
#### full where criteria
* should return the user with the correct name. - FAILED 
#### dynamic attribute
* should have [attribute]contains() method. - FAILED 
# Query
## Modifiers
### not (!)
* should return records with string usage. - FAILED 
* should return records with symbolic usage ! usage. - FAILED 
# Query
## IN Query Modifier
### with a record
* should return correct user. - FAILED 
* should return a model instance. - FAILED 
### without a record
# Query
## SKIP Query Modifier
* should return the correct amount of records. - FAILED 
* dynamic finder usage should return the correct amount of records. - FAILED 
* as an option should return correct amount of records. - FAILED 
# Query
## SORT Query Modifier
* should sort records using binary notation desc. - FAILED 
* should sort records using string notation for desc. - FAILED 
* should sort when sort is an option. - FAILED 
# Query
## case sensitivity
### .findOne()
* should work in a case insensitve fashion by default. - FAILED 
* should work with findOneBy*(). - FAILED 
### .find()
* should work in a case insensitve fashion by default. - FAILED 
* should work with findBy*(). - FAILED 
### special classified queries
* contains should work in a case insensitive fashion by default. - FAILED 
* startsWith should work in a case insensitive fashion by default. - FAILED 
* endsWith should work in a case insensitive fashion by default. - FAILED 
* like should work in a case insensitive fashion by default. - FAILED 
* endsWith should actually enforce endswith. - FAILED 
# Query
## .findOneLike()
* should return the user with the given name. - FAILED 
# Query
## count()
# Query
## .findLike()
* should return all the users with the given name. - FAILED 

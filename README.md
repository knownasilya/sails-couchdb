sails-couchdb: A CouchDB adapter for Sails.js
=============================================

Overview
--------

This is a prototype of a CouchDB adapter for Waterline for use in Sails.js.

I'm working on a custom adapter to fit my own personal uses. But as I go, I'm learning lessons on how to best
approach a generic CouchDB adapter for Sails. As I continue on my progress with my customized adapter, I will
make changes back to this one.

Tests
-----

This project is ongoing. I will be running integration tests as I implement more of the adapter.

This adapter was tested with [waterline-adapter-tests](https://github.com/balderdash/waterline-adapter-tests).

Here are the failures of the current test suite. Working on customizing the reporting so it looks cleaner:

# Collection
## Schema
### uniqueness

* should return an error if unique constraint fails. - FAILED 

## .findOne()

* should return a model instance. - FAILED 
* should work with just an id passed in. - FAILED 
* should work with no criteria passed in. - FAILED 

## .findOrCreateEach()

* should return model instances. - FAILED 

## .update()
### attributes

* should return model instances. - FAILED 
* should work with just an ID passed in. - FAILED 

## .destroy()
### a single record

* should return an empty array when searched for. - FAILED 

### multiple records

* should return an empty array when searched for. - FAILED 

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

### lessThan (<)

* should return records with lessThan key. - FAILED 
* should return records with symbolic usage < usage. - FAILED 

### lessThanOrEqual (<=)

* should return records with lessThanOrEqual key. - FAILED 
* should return records with symbolic usage <= usage. - FAILED 

### greaterThan (>)

* should return records with greaterThan key. - FAILED 
* should return records with symbolic usage > usage. - FAILED 

### greaterThanOrEqual (>=)

* should return records with greaterThanOrEqual key. - FAILED 
* should return records with symbolic usage >= usage. - FAILED 

## OR Query Modifier
### with a record

* should return the correct users. - FAILED 
* should return a model instances. - FAILED 

### startsWith
#### shorthand

* should return the user with the correct name. - FAILED 

#### full where criteria

* should return the user with the correct name. - FAILED 

#### dynamic attribute

* should have [attribute]StartsWith() method. - FAILED 

### LIKE

* should return the user with the given name. - FAILED 
* should support wrapping both sides with a % sign. - FAILED 

### contains
#### shorthand

* should return the user with the correct name. - FAILED 

#### full where criteria

* should return the user with the correct name. - FAILED 

#### dynamic attribute

* should have [attribute]contains() method. - FAILED 

### not (!)

* should return records with string usage. - FAILED 
* should return records with symbolic usage ! usage. - FAILED 

## IN Query Modifier
### with a record

* should return correct user. - FAILED 
* should return a model instance. - FAILED 

## SKIP Query Modifier

* should return the correct amount of records. - FAILED 
* dynamic finder usage should return the correct amount of records. - FAILED 
* as an option should return correct amount of records. - FAILED 

## SORT Query Modifier

* should sort records using binary notation desc. - FAILED 
* should sort records using string notation for desc. - FAILED 
* should sort when sort is an option. - FAILED 

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

## .findOneLike()

* should return the user with the given name. - FAILED 

## .findLike()
* should return all the users with the given name. - FAILED 

#!/usr/bin/env node

var elasticsearch = require('elasticsearch');
var config = require('../config');
var indexConfiguration = require('../src/index_configuration');

var util = require('substance-util');

var configureIndex = function(cb) {
  var client = new elasticsearch.Client(util.clone(config));
  client.indices.delete({
    index: ["*"],
    ignore: [404]
  }).then(function() {
    console.info('Configuring index...');
    return client.indices.create(indexConfiguration);
  }).error(function(error, resp) {
    console.error(error, resp);
    client.close();
    cb(error);
  })
  .done(function() {
    client.close();
    cb(null);
  });
};

module.exports = configureIndex;

#!/usr/bin/env node

var elasticsearch = require('elasticsearch');
var config = require('../config');
var indexConfiguration = require('../src/index_configuration');

var listOfUrls = require('../data/filelist');
var path = require('path');
var fs = require('fs');

var util = require('substance-util');
var LensArticle = require('lens-article');
var indexArticle = require('./index_article');

var idx = 0;

function step(cb) {
  if (idx >= listOfUrls.length) {
    console.error("Done.");
    cb(null);
    return;
  }
  var url = listOfUrls[idx++];
  var jsonFile = path.join(__dirname, "..", "data", "json", path.basename(url,".xml") + ".json");

  if (!fs.existsSync(jsonFile)) {
    console.error('JSON file does not exist', jsonFile);
    step(cb);
  } else {
    console.log('Indexing article %s...', path.basename(url,".xml"));
    var jsonData = fs.readFileSync(jsonFile, "utf8");
    var article = LensArticle.fromSnapshot(JSON.parse(jsonData));
    var client = new elasticsearch.Client(util.clone(config));
    indexArticle(client, article).then(function() {
      client.close();
      step(cb);
    });
  }
}

var seedIndex = function(cb) {
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
    step(cb);
  });
};

module.exports = seedIndex;

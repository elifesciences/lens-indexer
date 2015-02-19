#!/usr/bin/env node

var elasticsearch = require('elasticsearch');
var config = require('../config');

var listOfUrls = require('../data/filelist');
var path = require('path');
var fs = require('fs');

var util = require('substance-util');
var LensArticle = require('lens-article');
var indexArticle = require('./index_article');

var idx = 0;
var count = 0;
var MAX_COUNT = -1;

function step(cb) {
  if (idx >= listOfUrls.length || (MAX_COUNT > 0 && count >= MAX_COUNT)) {
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
      count++;
      step(cb);
    });
  }
}

var seedIndex = function(options, cb) {
  MAX_COUNT = options.MAX_COUNT || -1;
  count = 0;

  step(function(err) {
    if(err) {
      console.error(err);
      cb(err);
    } else {
      cb(null);
    }
  });
};

module.exports = seedIndex;

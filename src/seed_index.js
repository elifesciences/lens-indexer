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

function step(cb) {
  if (idx >= listOfUrls.length) {
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

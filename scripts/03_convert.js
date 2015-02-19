#!/usr/bin/env node

var listOfUrls = require('../data/filelist');
var path = require('path');
var fs = require('fs');
var convertArticle = require('../src/convert');

for (var i = 0; i < listOfUrls.length; i++) {
  var url = listOfUrls[i];
  var xmlFile = path.join(__dirname, "..", "data", "xml", path.basename(url));
  var jsonFile = path.join(__dirname, "..", "data", "json", path.basename(url, ".xml") + ".json");

  if (!fs.existsSync(jsonFile)) {
    console.log("Converting", path.basename(url));
    var xmlData = fs.readFileSync(xmlFile, "utf8")
    var article = convertArticle(xmlData);

    var jsonData = JSON.stringify(article.toJSON(), null, 2);
    fs.writeFileSync(jsonFile, jsonData);
  } else {
    console.log("Skipping", path.basename(url));
  }
}

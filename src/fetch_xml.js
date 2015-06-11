#!/usr/bin/env node

var request = require('request');
var listOfUrls = require('../data/filelist');
var path = require('path');
var fs = require('fs');

var idx = 0;
var errors = [];


var xmlDir = path.join(__dirname, "..", "data", "xml");
if (!fs.existsSync(xmlDir)) {
  console.log('creating data/xml.....');
  fs.mkdirSync(xmlDir);
}

function step(cb) {
  if (idx >= listOfUrls.length) {
    console.error("Done.");
    cb(null);
    return;
  }
  var url = listOfUrls[idx++];
  var fileName = path.basename(url);
  var filePath = path.join(__dirname, "..", "data", "xml", fileName);

  console.log("Fetching %s...", url);

  if (fs.existsSync(filePath)) {
    console.log("  ... File exists. Skipping.");
    return step(cb);
  }

  request(url, function (error, response, body) {
    if (error || response.statusCode != 200) {
      console.error("... could not load XML.");
      errors.push(error);
      step(cb);
    } else {
      fs.writeFileSync(filePath, body);
      step(cb);
    }
  });
}

var fetchXML = function(cb) {
  step(function() {
    if (errors.length > 0) {
      var msg = "Failures during fetching of XML files:\n" + errors.join('\n');
      cb(msg);
    } else {
      cb(null);
    }
  });
}

module.exports = fetchXML;

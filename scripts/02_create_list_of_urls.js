#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var request = require('request');
var outputFile = path.join(__dirname, "..", "data", "filelist.js");
var _ = require("underscore");
var fileListUrl = "http://s3.amazonaws.com/elife-cdn/xml_files.txt";



request(fileListUrl, function (error, response, fileList) {
  if (error || response.statusCode != 200) {
    console.error("Could not extract file-list from ", fileListUrl);
  } else {
    var urls = fileList.split(/\s+/);
    urls = _.compact(urls);
    fs.writeFileSync(outputFile, "module.exports = " + JSON.stringify(urls, null, 2));
  }
});

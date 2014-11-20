#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var request = require('request');
var XmlAdapterForXmlDomXPath = require('../src/xml_adapter_xmldom_xpath');

var URL_TEMPLATE = "https://s3.amazonaws.com/elife-cdn/elife-articles/$ID/elife$ID.xml";
var validUrls = [];
var outputFile = path.join(__dirname, "..", "data", "filelist.js");

function extractDocumentIds(xmlData) {
  var xmlAdapter = new XmlAdapterForXmlDomXPath();
  var xmlDoc = xmlAdapter.parseString(xmlData);
  // HACK: somehow xmldom+xpath has troubles to find something in that
  // doc... using hard-coded position.
  var resultEl = xmlDoc.childNodes[1];
  var child = resultEl.firstChild;
  while (child) {
    if (child.tagName === "Contents") {
      var keyEl = child.firstChild;
      var key = xmlAdapter.getText(keyEl);
      var match = /^documents\/elife\/(\d+)\.js$/.exec(key);
      if (match) {
        var id = match[1];
        console.log("###", id);
        var url = URL_TEMPLATE.replace(/\$ID/g, id);
        validUrls.push(url);
      }
    }
    child = child.nextSibling;
  }
  console.log("Writing urls to %s", outputFile);
  fs.writeFileSync(outputFile, "module.exports = " + JSON.stringify(validUrls, null, 2));
}

var bucketUrl = "https://s3.amazonaws.com/elife-cdn/";
request(bucketUrl, function (error, response, body) {
  if (error || response.statusCode != 200) {
    console.error("Could not extract bucket data from", bucketUrl);
  } else {
    extractDocumentIds(body);
  }
});

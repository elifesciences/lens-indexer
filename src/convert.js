"use strict";

var LensCoverter = require('lens-converter');
var XmlAdapterForXmlDomXPath = require('./xml_adapter_xmldom_xpath');

function convert(xmlData) {
  var xmlAdapter = new XmlAdapterForXmlDomXPath();
  var converter = new LensCoverter({
    xmlAdapter: xmlAdapter
  });
  var article = converter.import(xmlData);
  return article;
}

module.exports = convert;

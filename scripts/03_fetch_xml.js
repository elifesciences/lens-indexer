#!/usr/bin/env node

var fetchXML = require('../src/fetch_xml');

fetchXML(function(err) {
  if (err) {
    console.error(err);
  }
});

#!/usr/bin/env node

var seedIndex = require('../src/seed_index');

seedIndex(function(err) {
  if (err) {
    console.error(err);
  } else {
    console.log('Done.');
  }
});

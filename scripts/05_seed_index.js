#!/usr/bin/env node

var seedIndex = require('../src/seed_index');

var MAX_COUNT = process.argv[2];

seedIndex( { MAX_COUNT: MAX_COUNT }, function(err) {
  if (err) {
    console.error(err);
  } else {
    console.log('Done.');
  }
});

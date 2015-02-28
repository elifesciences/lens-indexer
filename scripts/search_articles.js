#!/usr/bin/env node

var searchArticles = require('../src/search_articles');

var query = {
  "searchString": "mouse",
  "filters": {
    // "subjects": ["Cell biology"],
    "organisms": ["Mouse"]
  }
}

searchArticles(query, function(err,result) {
  if (err) {
    console.error(err);
  } else {
    console.log(JSON.stringify(result, null, 2));
  }
});

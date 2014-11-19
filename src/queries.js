
var elasticsearch = require('elasticsearch');
var config = require("../config");

var queries = {};

queries.findDocumentsWithContent = function(query, cb) {
  var client = new elasticsearch.Client(config);
  var searchString = query.searchString;
  client.search({
    index: 'content',
    body: {
      query: {
        match: {
          content: searchString
        }
      }
    }
  }).then(function (body) {
    console.log('######', body, body.hits);
    var hits = body.hits.hits;
    var result = {};
    for (var i = 0; i < hits.length; i++) {
      var hit = hits[i];
      console.log("Hit: " + hit);
    }
    cb(null, result);
  }, function (error) {
    console.trace(error.message);
    cb(error);
  });
};

module.exports = queries;

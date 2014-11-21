
var elasticsearch = require('elasticsearch');
var config = require("../config");
var client = new elasticsearch.Client(config);

var queries = {};

queries.findDocumentsWithContent = function(query, cb) {
  var searchString = query.searchString;
  client.search({
    index: 'articles',
    type: 'article',
    body: {
      "query": {
        "bool": {
          "should": [{
            "has_child": {
              "type": "fragment",
              "score_mode" : "sum",
              "query": {
                "filtered": {
                  "query": {
                    "match": {
                      "content": {
                        "query": searchString,
                        "minimum_should_match": "99%"
                      }
                    }
                  }
                }
              }
            }
          },
          {
            "match": {
              "title": {
                "query": searchString,
                "boost": 100.0
              }
            }
          }]
        }
      }
    }
  }).then(function (body) {
    var hits = body.hits.hits;
    console.log(body);
    var result = [];
    for (var i = 0; i < hits.length; i++) {
      var hit = hits[i];
      // console.log(JSON.stringify(hit));
      hit._source.id = hit._id;
      hit._source.score = hit._score;
      result.push(hit._source);
    }
    cb(null, result);
  }, function (error) {
    console.trace(error.message);
    cb(error);
  });
};

module.exports = queries;

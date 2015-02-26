var elasticsearch = require('elasticsearch');
var config = require('../config');

var client = new elasticsearch.Client(config);

client.search({
  index: 'articles',
  type: 'article',
  body: {
    "query": {
      "match_all" : { }
    },
    "aggs": {
      "types": {
        "terms" : { "field" : "article_type" }
      },
      "subjects" : {
        "terms" : { "field" : "subjects" }
      },
      "keywords" : {
        "terms" : { "field" : "keywords" }
      },
      "organisms": {
        "terms" : { "field" : "organisms" }
      }
    }
  }
}).then(function (body) {
  var hits = body.hits.hits;
  console.log(JSON.stringify(body, null, 2));
  client.close();
}, function (error) {
  console.trace(error.message);
  client.close();
});

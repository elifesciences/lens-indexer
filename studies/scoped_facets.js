var elasticsearch = require('elasticsearch');
var config = require('../config');

var client = new elasticsearch.Client(config);

var searchString =  process.argv.slice(2).join(' ') || 'vivo'

console.log('# Searching for: %s', searchString);

client.search({
  index: 'articles',
  type: 'article',
  body: {
    "size": 30,
    "sort": [
      { "_score": { "order": "desc" } }
    ],
    "query": {
      "bool": {
        "should": [
          { "has_child": {
              "type": "fragment",
              "score_mode" : "sum",
              "query": {
                "match": {
                  "content": { "query": searchString, "minimum_should_match": "75%" }
                }
              }
            }
          },
          {
            "match": {
              "title": { "query": searchString, "minimum_should_match": "75%", "boost": 3.0 }
            }
          }
        ]
      }
    },
    // highlight can not be combined with a filtered query
    "highlight": {
      "pre_tags" : ['<span class="query-string">'], "post_tags" : ["</span>"],
      "fields": {
        // NOTE: "number_of_fragments" : 0 is necessary to suppress lucene's automatic truncation of fragments
        "title": { "number_of_fragments" : 0 },
        "intro": { "number_of_fragments" : 0 }
      }
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

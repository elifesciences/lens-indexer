var elasticsearch = require('elasticsearch');
var config = require('../config');
var _ = require('underscore');

var searchArticles = function(options, cb) {
  var client = new elasticsearch.Client(Object.create(config));

  function _query(searchString) {
    // either
    if (!searchString) {
      return {
        "match_all" : {}
      };
    } else {
      return {
        "bool": {
          "should": [
            {
              "has_child": {
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
      };
    }
  }

  function _filters(filters) {
    var matchTerms = [];
    _.each(filters, function(filterValues, facet) {
      _.each(filterValues, function(value) {
        var matchTerm = { "term": { } };
        matchTerm.term[facet] = value;
        matchTerms.push(matchTerm);
      });
    });

    if (matchTerms.length > 0) {
      return {
        "bool": {
          "should": [
            matchTerms
          ]
        }
      };
    } else {
      return null;
    }
  }

  var query = {
    index: 'articles',
    type: 'article',
    // only for debugging
    // explain: true,
    body: {
      "size": 30,
      "sort": [
        { "_score": { "order": "desc" } }
      ],
      "query": {
        "filtered": {
          "query": _query(options.searchString),
          "filter": _filters(options.filters),
        }
      },
      "highlight": {
        "pre_tags" : ['<span class="query-string">'], "post_tags" : ["</span>"],
        "fields": {
          // NOTE: "number_of_fragments" : 0 is necessary to suppress lucene's automatic truncation of fragments
          "title": { "number_of_fragments" : 0 },
          "intro": { "number_of_fragments" : 0 }
        }
      },
      "aggs": {
        "article_types": {
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
  };

  console.log("################################");
  console.log(JSON.stringify(query, null, 2));
  console.log("################################");

  client.search(query).then(function (body) {
    client.close();
    cb(null, body)
  }, function (error) {
    console.trace(error.message);
    client.close();
    cb(error);
  });
};

module.exports = searchArticles;

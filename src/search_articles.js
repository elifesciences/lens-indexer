var elasticsearch = require('elasticsearch');
var config = require('../config');
var _ = require('underscore');

var searchArticles = function(options, cb) {
  var client = new elasticsearch.Client(_.clone(config));

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
            },
            {
              "match": {
                  // Looks like minimum_should_match=25% makes search string case-insensitive
                  // However when applied to title, it doesn't give us matches.
                  "authors_string": { "query": searchString, "minimum_should_match": "25%", "boost": 3.0 }
              }
            },
            // Search by author impact statement
            {
              "match": {
                  "intro": { "query": searchString, "minimum_should_match": "25%", "boost": 2.0 }
              }
            },
            // Match of DOI
            {
              "match" : {
                  "doi" : searchString
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
          // TODO turn into must ?
          "must": [ 
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
          "authors_string": { "number_of_fragments" : 0 },
          "intro": { "number_of_fragments" : 0 },
          "doi": { "number_of_fragments" : 0 },
        }
      },
      "aggs": {

        "subjects" : {
          "terms" : { "field" : "subjects", "size": 100 }
        },
        "article_type": {
          "terms" : { "field" : "article_type", "size": 100 }
        },
        // "keywords" : {
        //   "terms" : { "field" : "keywords" }
        // },
        "authors": {
          "terms" : { "field" : "authors", "size": 30 }
        },
        "organisms": {
          "terms" : { "field" : "organisms", "size": 10 }
        }
      }
    }
  };


  if (!options.searchString) {
    query.body.sort = [{ "published_on": { "order": "desc" } }]
  }

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

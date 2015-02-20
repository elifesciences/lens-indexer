
var _ = require('underscore');
var elasticsearch = require('elasticsearch');
var config = require("../config");
var client = new elasticsearch.Client(config);
var queries = {};

queries.findDocumentsWithContent = function(query, cb) {
  var searchString = query.searchQuery.searchStr;
  var searchQuery = JSON.parse(query.searchQuery);

  var filters = [];

  _.each(searchQuery.filters, function(filterValues, filterFacet) {
    var f = {"terms": {} };
    f.terms[filterFacet] = filterValues;
    if (filterValues.length > 0) {
      filters.push(f);
    }
  });
  
  // Match all search query
  var searchQuery = { "match_all" : {}};

  if (searchString) {
    searchQuery = {
      "bool": {
        "should": [
          { "has_child": {
              "type": "fragment",
              "score_mode" : "sum",
              "query": {
                "filtered": {
                  "query": {
                    "match": {
                      "content": { "query": searchString, "minimum_should_match": "75%" }
                    }
                  }
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
              "intro": { "query": searchString, "minimum_should_match": "75%", "boost": 2.0 }
            }
          }
        ]
      }
    };
  }


  console.log('query with filters', filters);

  client.search({
    index: 'articles',
    type: 'article',
    body: {
      "size": 30,
      "sort": [
        // { "published_on":   { "order": "desc" }},
        { "_score": { "order": "desc" }}
      ],
      "query": {
        "filtered": {
          "query": searchQuery,
          "filter": {
            "bool": {
              "must": filters
            }
          },
          // highlight can not be combined with a filtered query
          // "highlight": {
          //   "pre_tags" : ['<span class="query-string">'], "post_tags" : ["</span>"],
          //   "fields": {
          //     // NOTE: "number_of_fragments" : 0 is necessary to suppress lucene's automatic truncation of fragments
          //     "title": { "number_of_fragments" : 0 },
          //     "intro": { "number_of_fragments" : 0 }
          //   }
          // }
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
      var documentResult = hit._source;
      documentResult.id = hit._id;
      documentResult.score = hit._score;
      if (hit.highlight) {
        for (var key in hit.highlight) {
          var content = hit.highlight[key];
          if (_.isArray(content)) {
            documentResult[key] = content.join('');
          } else {
            documentResult[key] = content;
          }
        }
      }
      result.push(documentResult);
    }
    cb(null, result);
  }, function (error) {
    console.trace(error.message);
    cb(error);
  });
};

queries.getDocumentMetaById = function(id) {
  return client.get({
    index: 'articles',
    type: 'article',
    id: id
  });
};

queries.getDocumentPreview = function(query, cb) {
  var documentId = query.documentId;
  var searchString = query.searchString;

  // create a result that contains
  // - fragments
  // - TODO: all figures
  // - TODO: document meta data

  var _documentMeta;
  var _fragments;

  function createDocumentPreview() {
    var result = {};
    result.document = _documentMeta;
    result.fragments = _fragments || [];
    cb(null, result);
  }

  queries.getDocumentMetaById(documentId)
  .then(function(data) {
    _documentMeta = data._source;
    return queries.findDocumentFragmentsWithContent(documentId, searchString);
  })
  .then(function(data) {
    _fragments = [];
    var fragments = data.hits.hits;
    fragments.sort(function(a, b) {
      return a._source.position - b._source.position;
    });
    for (var i = 0; i < fragments.length; i++) {
      var fragmentData = fragments[i];
      var fragmentResult = fragments[i]._source;
      if (fragmentData.highlight) {
        for (var key in fragmentData.highlight) {
          var highlightedContent = fragmentData.highlight[key].join('');
          console.log("Replacing:\n\t%s\n  with:\n\t%s", fragmentResult[key], highlightedContent);
          fragmentResult[key] = highlightedContent;
        }
      }
      _fragments.push(fragmentResult);
    }
    createDocumentPreview();
  })
  .error(function(error) {
    console.error("Urg", error);
    cb(error);
  });
};

queries.findDocumentFragmentsWithContent = function(documentId, searchString) {
  console.log("Asking for fragment in %s containing %s", documentId, searchString);
  return client.search({
    index: 'articles',
    type: 'fragment',
    body: {
      "query": {
        "bool": {
          "must": [
            { "term":  { "_parent": documentId } },
            { "match": { "content": { "query": searchString, "minimum_should_match": "75%" } } }
          ]
        }
      },
      "highlight": {
        "pre_tags" : ['<span class="query-string">'], "post_tags" : ["</span>"],
        "fields": {
          // NOTE: "number_of_fragments" : 0 is necessary to suppress lucene's automatic truncation of fragments
          "content": { "number_of_fragments" : 0 }
        }
      }
    }
  });
};

module.exports = queries;

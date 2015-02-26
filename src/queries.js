
var _ = require('underscore');
var elasticsearch = require('elasticsearch');
var config = require("../config");
var client = new elasticsearch.Client(config);
var queries = {};

var searchArticles = require("./search_articles");

queries.findDocumentsWithContent = function(query, cb) {
  var searchQuery = JSON.parse(query.searchQuery);
  searchArticles(searchQuery, cb);
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

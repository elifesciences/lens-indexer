
var _ = require('underscore');
var elasticsearch = require('elasticsearch');
var config = require("../config");
var client = new elasticsearch.Client(_.clone(config));
var queries = {};
var async = require('async');

var searchArticles = require("./search_articles");

queries.findDocumentsWithContentAdvanced = function(query, cb) {
  var searchQuery = JSON.parse(query.searchQuery);
  console.log('#####', searchQuery);

  searchArticles({
    searchString: searchQuery.searchStr,
    filters: searchQuery.filters
  }, function(err, result) {

    if (err) return cb(err);
    // assuming openFiles is an array of file names 
    async.each(result.hits.hits, function(doc, cb) {
      queries.getDocumentPreview({
        documentId: doc._id,
        searchString: searchQuery.searchStr
      }, function(err, docPreview) {
        if (err) return cb(err);
        doc.fragments = docPreview.fragments;
        cb(err);
      });
    }, function() {
      cb(null, result);
    });
  });
};


queries.findDocumentsWithContent = function(query, cb) {
  var searchQuery = JSON.parse(query.searchQuery);
  console.log('#####', searchQuery);

  searchArticles({
    searchString: searchQuery.searchStr,
    filters: searchQuery.filters
  }, cb);
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
      "size": 2,
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

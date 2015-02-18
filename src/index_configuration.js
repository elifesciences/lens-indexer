module.exports = {
  'index': 'articles',
  'body': {
    "settings": {
      "analysis": {
        "filter": {
          "trigrams_filter": {
            "type": "ngram",
            "min_gram": 3,
            "max_gram": 3
          }
        },
        "analyzer": {
          "html_content": {
            "type":      "custom",
            "tokenizer": "standard",
            "char_filter": [ "html_strip" ],
            "filter":   [ "classic" ]
          }
        }
      }
    },
    "mappings": {
      "article": {
       "properties": {
         // title and intro are indexed for fuzzy full-text search
         "title": { "type": "string", "index" : "analyzed", "analyzer": "html_content", "search_analyzer": 'snowball', "language": "English" },
         "intro": { "type": "string", "index" : "analyzed", "analyzer": "html_content", "search_analyzer": 'snowball', "language": "English" },
         // authors for exact full-text search (no partial matches)
         // "authors": { "type": "string", "index" : "analyzed", "analyzer": "standard" },
         "authors": { "type": "string", "index" : "not_analyzed"},
         // The rest are facets which are used for strict match queries or filtering only
         "published_on": { "type": "string", "index" : "not_analyzed"},
         "article_type": { "type": "string", "index" : "not_analyzed"},
         "subjects": { "type": "string", "index" : "not_analyzed"},
         "organisms": { "type": "string", "index" : "not_analyzed"}
       }
      },
      "fragment": {
        "_parent": {"type": "article"},
        "properties": {
          "id": { "type": "string", "index" : "not_analyzed" },
          "type": { "type": "string", "index" : "not_analyzed" },
          "content": { "type": "string", "index" : "analyzed", "analyzer": "html_content", "search_analyzer": 'snowball', "language": "English" },
          "position": { "type": "integer", "index": "not_analyzed" }
        }
      }
    }
  }
};

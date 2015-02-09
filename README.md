
# Lens Indexer

The Lens-Indexer represents a lookup service for Lens articles, built on top of an ElasticSearch index, and provides full-text search on artilc meta data (title, abstract, authors, keywords, etc.) as well as the content of article fragments.

> NOTE: this is work in progress and not yet feature complete.

## Demo Service

A demo instance of the service is running on https://lens-indexer.herokuapp.com/. It uses an ElasticSearch instance running on https://7zepvxjw:sqnl0xez3nmesypj@rowan-7428284.us-east-1.bonsai.io.
The index is seeded with the elife corpus found at https://s3.amazonaws.com/elife-cdn/

The index has the following structure

```
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
     "authors": { "type": "string", "index" : "analyzed", "analyzer": "standard" },
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
```

> Note: there is one index called `articles` having two types of entities, `article` and `fragment`, where a `fragment` is modelled as a child of an `article`.


It is possible to query the index directly using `curl`, such as:

```
curl https://7zepvxjw:sqnl0xez3nmesypj@rowan-7428284.us-east-1.bonsai.io/articles/fragment/_search -d '
{
 "query": {
    "match": {
      "content": "mice"
    }
  }
}'
```

## Local Installation

We use a Vagrant setup for installing for pulling up a virtual machine ( see `Vagrantfile`), however you can also study the `provision.sh` file to use a custom setup.
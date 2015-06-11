# Lens Indexer

The Lens-Indexer represents a lookup service for Lens articles, built on top of an ElasticSearch index, and provides full-text search on article meta data (title, abstract, authors, keywords, etc.) as well as the content of article fragments.

> Note: this is work in progress and should be considered experimental

## Demo Service

A demo instance of the service is running on heroku.com. It uses an ElasticSearch instance hosted on qbox.io. Click the following link to view a sample search result:

https://elife-lens-indexer.herokuapp.com/search?searchQuery=%7B%22searchStr%22%3A%22mouse%22%2C%22filters%22%3A%7B%7D%7D

The index is seeded with the eLife corpus found at http://s3.amazonaws.com/elife-cdn/xml_files.txt.

## Installation

### Prerequisites

- Node.js 0.10.x
- ElasticSearch 1.4.x

To simplify setup you can pull up a virtual machine using Vagrant ( see `Vagrantfile`). However since the setup is so simply you may just want to `provision.sh` to make your own setup.

### Setup

Clone the repo:

```bash
git clone https://github.com/elifesciences/lens-indexer.git
```

Pull in dependencies using the Substance Screwdriver:

```bash
cd lens-indexer
substance --update
```

Adjust `config.js` to point to ElasticSearch host:

```js
var config = {
  host: 'https://your-id.qbox.io'
};
```

## Seeding

We use individual scripts to seed the Elastic Search instance. You can combine them individually, according to your usecase. For instance if you want to update the index without resetting the index, just leave out step `01`.

**01 Configure Index**

```bash
$ scripts/01_configure_index.js
```

This sets up and resets the article and fragment indexes.

**02 Create list of urls**

```bash
$ scripts/02_create_list_of_urls.js
```

Takes the list of XML files from: http://s3.amazonaws.com/elife-cdn/xml_files.txt and stores it in `data/filelist.js`.

**03 Fetch XML**

```bash
$ scripts/03_fetch_xml.js
```

Download latest versions of XML files according to `data/filelist.js`.

**04 Convert**

```bash
$ scripts/04_convert.js
```

Converts XML files to Lens JSON using the Lens converter.

*Note: We needed to port the converter to run server-side. Since this code is experimental and not in sync with the official Lens converter, there may be slighly different resulting JSON files.*

**05 Seed Index**

```bash
$ scripts/05_seed_index.js
```

This is the part where the ES index is actually updated.

### Run

After seeding you can run the indexer.


```bash
$ PORT=4002 node server.js
```

Point your browser to the following url to test:

http://localhost:4002/search?searchQuery=%7B%22searchStr%22%3A%22mouse%22%2C%22filters%22%3A%7B%7D%7D

## Index structure

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

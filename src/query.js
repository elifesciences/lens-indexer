var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: 'https://7zepvxjw:sqnl0xez3nmesypj@rowan-7428284.us-east-1.bonsai.io',
  log: 'trace'
});

var searchString = "vivo";

client.search({
  index: 'articles',
  type: 'article',
  body: {
    "query": {
      "filtered": {
        "query": {
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
        },
        "filter": {
          "bool": {
            "must": [
              {"terms": {"subjects" : ["Neuroscience"]} },
              // {"terms": {"authors" : ["Verena Pawlak"]} }
              // {"terms": {"article_type" : ["Research advance"]} }
            ]
          }
        }
      }
    },
    // "query": {
    //   "has_child": {
    //     "type": "fragment",
    //     "query": {
    //       "filtered": {
    //         "query": {
    //           "match": {
    //             "content": {
    //               "query": "antimib",
    //               "minimum_should_match": "90%"
    //             }
    //           }
    //         }
    //       }
    //     }
    //   }
    // }
  }
}, function (error, response) {
  console.log(error, response);
});

// # curl -XPOST localhost:9200/articles/article/_search -d '{
// #   "query": {
// #     "has_child": {
// #       "type": "fragment",
// #       "query" : {
// #         "filtered": {
// #           "query": {
// #             "match": {
// #               "content": "anti"
// #             }
// #           }
// #         }
// #       }
// #     }
// #   }
// # }'

// client.search({
//   size: 20,
//   index: 'articles',
//   type: 'fragment',
//   body: {
//     query: {
//       match: {
//         "content": {
//           "query": "antimic",
//           "minimum_should_match": "90%"
//         }
//       }
//     }
//   }
// }, function (error, response) {
//   console.log(error, response);
// });

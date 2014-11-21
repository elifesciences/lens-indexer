var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});

client.search({
  index: 'articles',
  type: 'article',
  body: {
    "query": {
      "has_child": {
        "type": "fragment",
        "query": {
          "filtered": {
            "query": {
              "match": {
                "content": {
                  "query": "antimib",
                  "minimum_should_match": "90%"
                }
              }
            }
          }
        }
      }
    }
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

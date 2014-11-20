
function registerIndexes(client) {
  client.indices.create({
    index: 'articles',
    type: 'article'
  }, function(error, resp, respcode) {
    if (error) {
      console.error(error, resp, respcode);
      client.close();
    } else {
      client.indices.putMapping({
        index: 'articles',
        type: 'article',
        body: {
          "article": {
            // TODO: specify how to index?
          },
          "fragment": {
            "_parent": {
              type: 'article'
            }
          }
        }
      },
      function(error, resp) {
        if (error) {
          console.error(error, resp);
        } else {
          console.log('Created index "articles/article/fragment');
        }
        client.close();
      });
    }
  }, function(error, resp, respcode){
    console.error(error, resp, respcode);
    client.close();
  });
}

var elasticsearch = require('elasticsearch');
var config = require('../config');
var client = new elasticsearch.Client(config);
registerIndexes(client);

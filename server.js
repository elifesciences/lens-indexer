"use strict";

var express = require('express');
var app = express();
var queries = require('./src/queries');

app.set('port', (process.env.PORT || 4002))

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/search', function (req, res) {
  queries.findDocumentsWithContent(req.query, function(error, result) {
    if (error) {
      res.send('500', error.message);
    } else {
      res.send(result);
    }
  });
});

app.get('/search/document/', function (req, res) {
  queries.getDocumentPreview({
    documentId: req.query.documentId,
    searchString: req.query.searchString
  }, function(error, result) {
    if (error) {
      res.send('500', error.message);
    } else {
      res.send(result);
    }
  });
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.post('/', function (req, res) {
  res.send(404);
});

app.use(express.static(__dirname));

var server = app.listen(app.get('port'), function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});

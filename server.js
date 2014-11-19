"use strict";

var express = require('express');
var app = express();
var queries = require('./src/queries');

app.get('/article/json/:id', function (req, res) {
  res.send('Asking for article json...');
});

app.get('/article/html/:id', function (req, res) {
  res.send('Asking for prerendered article...');
});

app.get('/search', function (req, res) {
  queries.findDocumentsWithContent({
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

app.use(express.static(__dirname));

var server = app.listen(4002, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});

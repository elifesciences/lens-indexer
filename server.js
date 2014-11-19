var express = require('express');
var app = express();

app.get('/article/json/:id', function (req, res) {
  res.send('Asking for article json...');
});

app.get('/article/html/:id', function (req, res) {
  res.send('Asking for prerendered article...');
});

app.get('/search', function (req, res) {
  res.send('Search query...');
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

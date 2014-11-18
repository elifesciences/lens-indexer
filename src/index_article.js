var elasticsearch = require('elasticsearch');

var argv = require("yargs")
  .strict()
  .usage("Usage: converter -i input.json", {
    i: {
        describe: 'specify input file',
        alias: ('i','input')
    },
  })
  .demand(['i'])
  .argv;

var fs = require("fs");
var path = require("path");

var inputFile = path.join(__dirname, "..", "data", "json", ""+argv.i);
var articleData = fs.readFileSync(inputFile, "utf8");
var article = JSON.parse(articleData);

var nodes = article.nodes;
var content = nodes.content.nodes;

debugger;

for (var i = 0; i < content.length; i++) {
  var id = content[i];
  var node = nodes[id];

  if (!node) {
    console.error("Node not existing", id);
    continue;
  }

  var type = node.type;
  var textContent = null;

  switch (type) {
    case "paragraph":
      var textNodeId = node.children[0];
      var textNode = nodes[textNodeId];
      if (textNode) {
        textContent = textNode.content;
      } else {
        continue;
      }
      break;
    case "heading":
      textContent = node.content;
      break;
    default:
      continue;
  }
  var publicationInfo = nodes.publication_info;
  var doi = publicationInfo.doi;
  doi = doi.replace('http://dx.doi.org/', '');
  var esId = doi + "/" + id;
  var indexEntry = {
    index: 'content',
    type: type,
    id: esId,
    body: {
      type: type,
      content: textContent,
      position: i
    }
  };
  console.log("Indexing ", indexEntry);
  // client.index(
  // }, function (error, response) {
  //   console.log(error, response);
  // });
}

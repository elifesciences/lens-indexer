var fs = require("fs");

function indexArticle(client, inputFile) {

  var articleData = fs.readFileSync(inputFile, "utf8");
  var article = JSON.parse(articleData);

  var nodes = article.nodes;
  var nodeIds = nodes.content.nodes;

  var publicationInfo = nodes.publication_info;
  var doi = publicationInfo.doi;
  doi = doi.replace('http://dx.doi.org/', '');

  // record all entries and call ES later, so that we only index if everything goes well
  var indexEntries = [];

  // add the article as a whole
  var articleEntry = {
    index: 'articles',
    type: 'json',
    id: doi,
    body: article
  };
  indexEntries.push(articleEntry);

  nodeIds.forEach(function(nodeId, pos) {
    var node = nodes[nodeId];
    if (!node) {
      throw new Error("Corrupted article json. Node does not exist " + nodeId);
    }
    var type = node.type;
    var plainText = null;
    switch (type) {
      case "paragraph":
        var textNodeId = node.children[0];
        var textNode = nodes[textNodeId];
        if (textNode) {
          plainText = textNode.content;
        } else {
          return;
        }
        break;
      case "heading":
        plainText = node.content;
        break;
      default:
        return;
    }
    if (!plainText) {
      return;
    }
    // Note: using the DOI as global unique id and the node's id as suffix
    var entryId = doi + "/" + nodeId;
    var nodeEntry = {
      index: 'content',
      type: type,
      id: entryId,
      body: {
        id: nodeId,
        type: type,
        content: plainText,
        document: doi,
        position: pos
      }
    };
    indexEntries.push(nodeEntry);
  });

  var promise = null;
  indexEntries.forEach(function(entry) {
    if (!promise) {
      promise = client.index(entry);
    } else {
      promise.then(function() { return client.index(entry); });
    }
  });

  return promise;
}

module.exports = indexArticle;

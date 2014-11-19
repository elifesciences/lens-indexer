
function indexArticle(client, article) {

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

  // TODO: continue here. We need to provide a good trade-off
  // between structured and prerendered data. E.g., it would be good
  // to prerender primitive annotations. Also we need to come up with a
  // short intro text (it is hidden in a custom-meta tag atm and not extracted
  // at all). The abstract is not available neither, as the converter does not
  // preserve that semantics. Furthermore it would be necessary to 'configure'
  // which facets should be considered (and potentially, how to extract them)
  var shortData = {
    "title": article.title,
    "authors": [],
    "intro": "", // prerendered html
    // facets
    "published_on": "2014-11-10",
    "updated_at": "2014-11-18",
    "article_type": "Research Article",
    "subject": "Cell biology"
  };
  var shortEntry = {
    index: 'short',
    id: doi,
    body: shortData
  };
  indexEntries.push(shortEntry);

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

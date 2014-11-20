
var _ = require('underscore');
var XmlAdapterForXmlDomXPath = require('./xml_adapter_xmldom_xpath');

function indexArticle(client, article) {

  var nodes = article.nodes;
  var nodeIds = nodes.content.nodes;

  var documentNode = article.get('document');
  var publicationInfo = article.get('publication_info');
  // var abstract = article.get(documentNode.abstract);
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
  var xmlAdapter = new XmlAdapterForXmlDomXPath();
  var htmlDocument = xmlAdapter.parseString('<html></html>');
  var shortData = {
    "title": xmlAdapter.getInnerHtml(documentNode.propertyToHtml(htmlDocument, 'title')),
    "authors": _.map(documentNode.getAuthors(), function(author) {
      return author.name;
    }),
    "intro": "TODO: this should be a short intro which ATM is not extracted.", // prerendered html
    // facets
    "published_on": xmlAdapter.getInnerHtml(publicationInfo.propertyToHtml(htmlDocument, 'published_on')),
    "article_type": publicationInfo.article_type || "",
    "subjects": publicationInfo.subjects || [],
    "organisms": publicationInfo.research_organisms || []
  };
  htmlDocument = null;
  xmlAdapter = null;
  var shortEntry = {
    index: 'short',
    type: 'json',
    id: doi,
    body: shortData
  };
  indexEntries.push(shortEntry);
  // console.log("#################");
  // console.log("Short Entry:");
  // console.log(shortEntry);
  // console.log("#################");
  nodeIds.forEach(function(nodeId, pos) {
    var node = nodes[nodeId];
    if (!node) {
      throw new Error("Corrupted article json. Node does not exist " + nodeId);
    }
    var xmlAdapter = new XmlAdapterForXmlDomXPath();
    var htmlDocument = xmlAdapter.parseString('<html></html>');

    var type = node.type;
    var plainText = null;
    var html = null;
    switch (type) {
      case "paragraph":
      case "heading":
        plainText = node.content;
        html = xmlAdapter.toString(node.toHtml(htmlDocument));
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
        html: html || "<p>Error: could not render HTML for node "+nodeId+"</p>",
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

(function() {

/* global window:true */

var SearchHandler = function($container) {
  this.$searchBar = $container.find('#searchbar');
  this.$searchField = this.$searchBar.find('.search-field');
  this.$searchButton = this.$searchBar.find('.search-button');
  this.$searchButton.click(this.onClick.bind(this));
  this.$searchField.keydown(this.onEnter.bind(this));

  this.$resultList = $container.find('#result-list');
  this.$documentPreview = $container.find('#document-preview');
  this.$selectedDocument = null;

  // TODO: remove this after initial testing
  this.$searchField.val("novel");
  this.$searchButton.click();
};
SearchHandler.Prototype = function() {

  this.onClick = function(e) {
    e.preventDefault();
    e.stopPropagation();
    this.search();
  };

  this.onEnter = function(e) {
    if(e.keyCode == 13) {
      e.preventDefault();
      e.stopPropagation();
      this.search();
    }
  };

  this.search = function() {
    var self = this;
    var searchString = this.$searchField.val();
    this.clearPreview();
    if (searchString) {
      $.ajax({
        url: "/search",
        method: "GET",
        crossDomain: true,
        data: {
          searchString: searchString
        }
      }).done(function(result) {
        self.renderResult(result);
      });
    } else {
      this.$resultList.empty();
    }
  };

  this.renderResult = function(result) {
    var $list =  $(window.document.createDocumentFragment());
    result.forEach(function(documentData) {
      var $entry = $('<div>').addClass('document');

      var header = this.renderDocumentHeader(documentData);
      $entry.append([header.$arcticleType, header.$authors, header.$title]);
      $entry.append($('<h2>').addClass('intro').html(documentData.intro));
      this.renderFacets($entry, documentData);
      $entry.append($('<div>').addClass('score').text("Relevance: " + documentData.score));

      var $previewButton = $("<a>").addClass('show-preview').text('Show Preview');
      $previewButton.click(this.showPreview.bind(this, documentData.id, $entry));
      $entry.append($previewButton);

      $list.append($entry);
    }, this);
    this.$resultList.empty();
    this.$resultList.append($list);
  };

  this.renderDocumentHeader = function(documentData) {
    var $arcticleType;
    if (documentData.article_type) {
      $("<div>").addClass('article-type').text(documentData.article_type);
    }
    var $authors = null;
    if (documentData.authors.length > 0) {
      $authors = $("<div>").addClass('authors');
      for (var i = 0; i < documentData.authors.length; i++) {
        $authors.append($('<span>').addClass('author').text(documentData.authors[i]));
      }
    }
    var $title = $('<h1>').addClass('title').html(documentData.title);
    return {
      $arcticleType: $arcticleType,
      $authors: $authors,
      $title: $title
    };
  };

  this.renderFacets = function($el, documentData) {
    var i;
    var $facets = $("<div>").addClass('facets');
    if (documentData.subjects.length > 0) {
      var $subjects = $("<div>").addClass('subjects');
      for (i = 0; i < documentData.subjects.length; i++) {
        $subjects.append($('<span>').addClass('subject').text(documentData.subjects[i]));
      }
      $facets.append($subjects);
    }
    if (documentData.organisms.length > 0) {
      var $organisms = $("<div>").addClass('organisms');
      for (i = 0; i < documentData.organisms.length; i++) {
        $organisms.append($('<span>').addClass('subject').text(documentData.organisms[i]));
      }
      $facets.append($organisms);
    }
    $el.append($facets);
  };

  this.renderPreview = function(result) {
    var $preview =  $(window.document.createDocumentFragment());

    var documentData = result.document;

    var header = this.renderDocumentHeader(documentData);
    $preview.append([header.$arcticleType, header.$title, header.$authors]);

    // TODO: provide abstract
    var $abstract = $('<div>').addClass('abstract');
    $preview.append($abstract);

    $preview.append($('<h1>').addClass('fragments-header').text("Excerpt from article matching your query:"));

    var $fragments = $('<div>').addClass('fragments');
    var lastPos = 0;
    for (var i = 0; i < result.fragments.length; i++) {
      var fragment = result.fragments[i];
      if (fragment.position - lastPos > 1) {
        $fragments.append($('<div>').addClass('skip'));
      }
      $fragments.append($(fragment.content));
      lastPos = fragment.position;
    }
    $preview.append($fragments);

    // TODO: provide all figures (to present thumbnails)
    var $figures = $('<div>').addClass('figures');
    $preview.append($figures);

    this.renderFacets($preview, documentData);

    this.$documentPreview.empty();
    this.$documentPreview.append($preview);
  };

  this.clearPreview = function() {
    if (this.$selectedDocument) {
      this.$selectedDocument.removeClass('selected');
    }
    this.$selectedDocument = null;
    this.$documentPreview.empty();
  };

  this.showPreview = function(documentId, $documentEl, event) {
    event.preventDefault();
    event.stopPropagation();

    if (this.$selectedDocument) {
      this.$selectedDocument.removeClass('selected');
    }

    var self = this;
    var searchString = this.$searchField.val();
    $.ajax({
      url: "/search/document/",
      method: "GET",
      crossDomain: true,
      data: {
        documentId: documentId,
        searchString: searchString
      }
    }).done(function(result) {
      self.renderPreview(result);
    });

    this.$selectedDocument = $documentEl;
    this.$selectedDocument.addClass('selected');

    console.log("TODO: show preview for document", documentId);
  };
};
SearchHandler.prototype = new SearchHandler.Prototype();

function init() {
  new SearchHandler($('#container'));
}

$(init);

})();

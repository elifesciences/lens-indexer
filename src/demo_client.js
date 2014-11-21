(function() {

/* global window:true */

var SearchHandler = function($container) {
  this.$searchBar = $container.find('#searchbar');
  this.$searchField = this.$searchBar.find('.search-field');
  this.$searchButton = this.$searchBar.find('.search-button');
  this.$searchButton.click(this.onClick.bind(this));
  this.$resultList = $container.find('#result-list');
};
SearchHandler.Prototype = function() {
  this.onClick = function(e) {
    e.preventDefault();
    e.stopPropagation();
    this.search();
  };
  this.search = function() {
    var self = this;
    var searchString = this.$searchField.val();
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
    result.forEach(function(entry) {
      var i;
      var $entry = $('<div>').addClass('document');
      if (entry.article_type) {
        $entry.append($("<div>").addClass('article-type').text(entry.article_type));
      }
      if (entry.authors.length > 0) {
        var $authors = $("<div>").addClass('authors');
        for (i = 0; i < entry.authors.length; i++) {
          $authors.append($('<span>').addClass('author').text(entry.authors[i]));
        }
        $entry.append($authors);
      }
      $entry.append($('<div>').addClass('title').html(entry.title));
      $entry.append($('<div>').addClass('intro').html(entry.intro));
      if (entry.subjects.length > 0) {
        var $subjects = $("<div>").addClass('subjects');
        for (i = 0; i < entry.subjects.length; i++) {
          $subjects.append($('<span>').addClass('subject').text(entry.subjects[i]));
        }
        $entry.append($subjects);
      }
      if (entry.organisms.length > 0) {
        var $organisms = $("<div>").addClass('organisms');
        for (i = 0; i < entry.organisms.length; i++) {
          $organisms.append($('<span>').addClass('subject').text(entry.organisms[i]));
        }
        $entry.append($organisms);
      }

      $entry.append($('<div>').addClass('score').text(entry.score));

      $list.append($entry);
    });
    this.$resultList.empty();
    this.$resultList.append($list);
  };
};
SearchHandler.prototype = new SearchHandler.Prototype();

function init() {
  new SearchHandler($('#container'));
}

$(init);

})();

(function() {

var SearchHandler = function($container) {
  this.$searchBar = $container.find('#searchbar');
  this.$searchField = this.$searchBar.find('.search-field');
  this.$searchButton = this.$searchBar.find('.search-button');

  this.$searchButton.click(this.onClick.bind(this));
};
SearchHandler.Prototype = function() {
  this.onClick = function(e) {
    e.preventDefault();
    e.stopPropagation();
    this.search();
  };
  this.search = function() {
    console.log("searching");
  };
};
SearchHandler.prototype = new SearchHandler.Prototype();

function init() {
  new SearchHandler($('#container'));
}

$(init);

})();

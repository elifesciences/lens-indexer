(function() {

var SearchHandler = function($container) {
  this.$searchBar = $container.find('#searchbar');
  this.$searchField = this.$searchBar.find('.search-field');
  this.$searchButton = this.$searchBar.find('.search-button');
  this.$searchButton.click(this.onClick.bind(this));
  this.lastQuery = null;
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
    if (searchString && searchString !== this.lastQuery) {
      $.ajax({
        url: "/search",
        method: "GET",
        crossDomain: true,
        data: {
          searchString: searchString
        }
      }).done(function(data) {
        console.log("YAY", data);
        self.lastQuery = searchString;
      });
    }
  };
};
SearchHandler.prototype = new SearchHandler.Prototype();

function init() {
  new SearchHandler($('#container'));
}

$(init);

})();

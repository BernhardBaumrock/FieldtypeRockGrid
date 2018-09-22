/**
 * show pagination page size
 */
document.addEventListener('RockGridItemLoadPlugins', function(e) {
  RockGrid.getGrid(e.target).registerPlugin(function() {
    this.name = 'paginationPageSize';
  
    this.onLoad = function() {
      var grid = this.grid;
      
      // dont show selectbox under some circumstances
      if(grid.js.settings.height > 0) return; // manual height
      if(grid.gridOptions.pagination === false) return; // pagination disabled
    
      // add the selectbox
      var wrapper = grid.getWrapperDOM();
      var el = document.createElement('div');
      wrapper.insertBefore(el, wrapper.firstChild);
    
      // html element
      var out = '<div class="paginationPageSize">' + RockGrid.str.rows + ': <select onchange="RockGridChangePaginationSize(this)" class="uk-form-small">';
      for(var i=0; i<grid.js.settings.pageSizes.length; i++) {
        var selected = (grid.js.settings.initPageSize == grid.js.settings.pageSizes[i])
          ? ' selected'
          : '';
        out += '<option' + selected + '>' + grid.js.settings.pageSizes[i] + '</option>';
      }
      out += '</select></div>';
      el.outerHTML = out;
    }
  });
});

// change pagination size callback
var RockGridChangePaginationSize = function(e) {
  var val = e.options[e.selectedIndex].text;
  RockGrid.getGrid(e).api().paginationSetPageSize(val*1);
}
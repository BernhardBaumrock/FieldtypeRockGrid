/**
 * RockGrid class
 */
function RockGrid() {
  // object holding all individual gridItems
  this.gridItems = {};

  // object holding plugins
  this.plugins = {};

  // object holding renderers
  this.renderers = {};

  // object holding formatters
  // https://www.ag-grid.com/javascript-grid-value-getters/#value-formatter
  this.formatters = {};

  // object holding colDefs
  this.coldefs = {};

  // manually defined global options
  // these options are set for all grids
  this.gridOptions = {
    enableFilter: true,
    enableSorting: true,
    enableColResize: true,
    floatingFilter: true,
  }

  // object holding all filters
  this.filters = {}

  // are we in the backend?
  this.backend = false;
  if(typeof ProcessWire !== 'undefined') this.backend = true;
};

/* ######################### helper methods ######################### */

  /**
   * debounce function execution
   * useful for handling filter inputs
   * see https://davidwalsh.name/javascript-debounce-function
   */
  RockGrid.prototype.debounce = function(func, wait, immediate) {
    var wait = wait || 500; // 500ms default
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };

  /**
   * get a new empty column object
   */
  RockGrid.prototype.getDefaultColumn = function(options) {
    var def = {
      headerName: RockGrid.hoverSpan(options.headerName),
      field: options.field || null,
      minWidth: 100,

      // this keeps the filter when data is refreshed by ajax
      filterParams: {newRowsAction: 'keep'},

      // don't show filter icon on floating filters by default
      // see https://www.ag-grid.com/javascript-grid-filtering/#floating-filters
      floatingFilterComponentParams: {suppressFilterButton:true},
    };

    // add all settings
    for(var prop in options) {
      if(prop == 'headerName') continue;
      if(prop == 'field') continue;
      def[prop] = options[prop];
    }

    return def;
  }

  /**
   * add a new grid to the object
   */
  RockGrid.prototype.getGrid = function(grid) {
    if(typeof grid == typeof undefined) {
      console.warn('grid must be defined');
      return;
    }

    // check if grid is a params object
    try {
      grid = grid.node.gridOptionsWrapper.environment.eGridDiv.id;
    }
    catch(err) { // nothing
    }

    // if a dom element was passed we look for the griditem and take the id as grid
    if(typeof grid !== 'string') {

      // if the grid parameter is the wrapper element we return the grid instantly
      if(grid.classList.contains('RockGridItem')) {
        grid = grid.id.replace('RockGridItem_','');
      }
      else if(grid.classList.contains('RockGridWrapper')) {
        grid = grid.querySelector('.RockGridItem');
        grid = grid.id.replace('RockGridItem_','');
      }
      else {
        var closest = function(el, selector) {
          var matchesFn;
      
          // find vendor prefix
          ['matches','webkitMatchesSelector','mozMatchesSelector','msMatchesSelector','oMatchesSelector'].some(function(fn) {
            if (typeof document.body[fn] == 'function') {
              matchesFn = fn;
              return true;
            }
            return false;
          })
      
          var parent;
      
          // traverse parents
          while (el) {
            parent = el.parentElement;
            if (parent && parent[matchesFn](selector)) {
              return parent;
            }
            el = parent;
          }
      
          return null;
        }
        grid = closest(grid, '.RockGridWrapper').querySelector('.RockGridItem');
        grid = grid.id.replace('RockGridItem_','');
      }
    }
    grid = grid.replace('RockGridItem_','');
    return RockGrid.gridItems[grid]; 
  }

  /**
   * initialise the griditem
   */
  RockGrid.prototype.init = function(settings) {
    var grid = settings.grid;
    var dataColumns = settings.dataColumns;
    var data = settings.data;
    var js = settings.js;

    if(!dataColumns.length) {
      // data columns where not set by php
      // we set the data columns from the data source
      var object = data[0];
      for (var property in object) {
        if (object.hasOwnProperty(property)) {
          dataColumns.push(property);
        }
      }
    }
    
    // create the gridItem
    this.gridItems[grid] = new RockGridItem({}, dataColumns);
    this.gridItems[grid].id = grid;
    this.gridItems[grid].data = data;

    // get the grid's dom element
    var el = document.querySelector('#RockGridItem_' + grid);

    // event listener to get data either from AJAX or from the config object
    el.addEventListener('RockGridItemAfterInit', function(event) {
      var grid = RockGrid.getGrid(event.target);
      var api = grid.gridOptions.api;

      if(grid.data == 'ajax') {
        grid.getAjaxData();
      }
      else {
        // set data from the grid's data property
        // if the data was set via the gridOptions take this data
        if(grid.data && grid.gridOptions.rowData) {
          console.error('Define either grid.data OR gridOptions.rowData, not both!');
        }

        api.setRowData(grid.gridOptions.rowData || grid.data);
      }
    });

    // populate custom javascript variables (eg for translations)
    this.gridItems[grid].js = js;

    // setup pagination page size
    var opt = this.gridItems[grid].gridOptions;
    opt.pagination = true;
    if(js.settings.height > 0) {
      opt.paginationPageSize = null;
      opt.paginationAutoPageSize = true;
    }
    else {
      opt.domLayout = 'autoHeight';
      opt.paginationPageSize = js.settings.initPageSize;
    }

    // create grid and fire events
    el.dispatchEvent(new Event('RockGridItemBeforeInit', {bubbles:true}));
    new agGrid.Grid(el, this.gridItems[grid].gridOptions);
    el.dispatchEvent(new Event('RockGridItemLoadPlugins', {bubbles:true}));
    el.dispatchEvent(new Event('RockGridItemAfterInit', {bubbles:true}));

    // remove .init dom element
    var initDiv = document.querySelector('#RockGridWrapper_' + grid + ' .init');
    if(initDiv) initDiv.parentNode.removeChild(initDiv);
  }

/* ######################### helper functions ######################### */

  /**
   * replace tags by value of current row
   */
  RockGrid.prototype.replaceTags = function(str, params) {
    var result = str.match(/{(.*?)}/g);
    if(!result) return str;

    // replace tags
    var notfound = false;
    result.map(function(val) {
      var field = val.replace(/{|}/g,'');
      str = str.replace(val, params.data[field]);
      if(params.data[field] == null) notfound = true;
    });

    // don't show icon if a tag's value was null
    if(notfound) return false;
    return str;
  }
  
  /**
   * wrap a span with hover info around the current string
   */
  RockGrid.prototype.hoverSpan = function(str, hovertext, icon) {
    if(!hovertext) {
      hovertext = str;
      icon = false;
    }

    if(icon === false) icon = '';
    else {
      if(typeof icon === 'string') icon = '<i class="fa fa-' + icon + '"></i>';
      else icon = '<i class="fa fa-comment-o"></i>';
    }
    return '<span title="' + hovertext + '">' + str + ' ' + icon + '</span>';
  }

  /**
   * round a number to given number of digits
   */
  RockGrid.prototype.toFixed = function(number, digits) {
    digits = digits || 2;
    return number.toFixed(digits)*1;
  }

  /**
   * strip html tags
   */
  RockGrid.prototype.stripTags = function(str) {
    var tmp = document.createElement("DIV");
    tmp.innerHTML = str;
    return tmp.textContent || tmp.innerText || "";
  }

// assign global rockgrid variable
var RockGrid = new RockGrid();
document.dispatchEvent(new Event('RockGridReady'));

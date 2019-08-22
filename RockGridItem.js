/**
 * RockGridItem class
 */
function RockGridItem(gridOptions, dataColumns, frontendorbackend) {
  this.dataColumns = dataColumns;
  this.gridOptions = this.mergeOptions(gridOptions);

  // plugins config object
  this.plugins = {};

  // object for custom variables, eg translations
  this.js = {};
};

/* ######################### helper functions ######################### */

  /**
   * proxy for api and columnApi
   */
  RockGridItem.prototype.api = function() { return this.gridOptions.api; }
  RockGridItem.prototype.columnApi = function() { return this.gridOptions.columnApi; }

  /**
   * get dom element for this grid
   */
  RockGridItem.prototype.getDOM = function() { return document.getElementById('RockGridItem_' + this.id); }

  /**
   * get dom element for this grid's wrapper
   */
  RockGridItem.prototype.getWrapperDOM = function() { return document.getElementById('RockGridWrapper_' + this.id); }

  /**
   * get merged options for this grid
   */
  RockGridItem.prototype.mergeOptions = function(gridOptions) {
    // get the current options
    if(!this.gridOptions) {
      // this is the first call of mergeOptions
      // we take the global options as initial options
      this.gridOptions = RockGrid.gridOptions;
    }

    // setup columndefs for this grid
    this.gridOptions.columnDefs = this.getColumnDefsFromData();

    // merge global options into options of this grid
    var mergedOptions = Object.assign({}, this.gridOptions, gridOptions);

    return mergedOptions;
  }
  
  /**
   * Get data of this grid.
   * 
   * Values set by valueGetters will NOT be included in this dataset.
   */
  RockGridItem.prototype.getData = function() {
    var arr = [];
    var api = this.gridOptions.api;
    api.forEachNode(function(rowNode, index) {
      arr.push(rowNode.data);
    });
    return arr;
  }

  /**
   * Get data of this grid as array matrix.
   * 
   * This will export the grid as CSV and then parse this CSV to return an array.
   * This is for sure not the best solution, but the best I could do so far.
   * For a list of all options see https://www.ag-grid.com/javascript-grid-export/
   * Cell Renderers will NOT be used.
   * Value Getters will be used.
   * Cell Formatters will NOT be used (use processCellCallback instead).
   */
  RockGridItem.prototype.getDataMatrix = function(params) {
    var api = this.api();
    var colApi = this.gridOptions.columnApi;

    // prepare params
    // make sure to skip the header line on data export
    var params = params || {};
    params.skipHeader = true;

    // populate columns id array
    var colIds = [];
    var colHeaders = [];
    var all = colApi.getAllColumns();
    for(var i = 0; i<all.length; i++) {
      var item = all[i];
      colIds.push(item.colId);
      colHeaders.push(item.colDef.headerName);
    }

    // populate row data
    var rows = Papa.parse(api.getDataAsCsv(params)).data;

    // populate matrix object
    var matrix = {
      colIds: colIds,
      colHeaders: colHeaders,
      rows: rows,
    }

    return matrix;
  }
  
  /**
   * Get row data of DataMatrix.
   * 
   * A DataMatrix can be provided as second argument to not parse the data over and over again.
   */
  RockGridItem.prototype.getDataMatrixRow = function(rowName, matrix) {
    var matrix = matrix || this.getDataMatrix();

    // get index of colId
    var index = false;
    for(var i = 0; i<matrix.rows.length; i++) {
      var row = matrix.rows[i];
      var newRow = row.slice(); // create clone
      if(newRow.shift() == rowName) return newRow;
    }

    return false;
  }

  /**
   * add options
   * 
   * @param object gridOptions
   * 
   * if no grid is specified we merge the specified options
   * into the global options of the RockGrid object
   */
  RockGridItem.prototype.addOptions = function(gridOptions) {
    this.gridOptions = this.mergeOptions(gridOptions);
  }

  /**
   * get column defs from data array
   */
  RockGridItem.prototype.getColumnDefsFromData = function() {
    var colDefs = [];
    for(i=0; i<this.dataColumns.length; i++) {
      colDefs.push(RockGrid.getDefaultColumn({
        headerName: this.dataColumns[i],
        field: this.dataColumns[i],
      }));
    }
    return colDefs;
  }
  
  /**
   * get column def by field name
   */
  RockGridItem.prototype.getColDef = function(field, callback) {
    var colDefs = RockGrid.gridItems[this.id].gridOptions.columnDefs;
    var col = null;
    for(var i=0; i<colDefs.length; i++) {
      if(colDefs[i].field == field) {
        col = colDefs[i];
      }
    }

    if(!col) console.warn("no coldef found for " + field);
    else {
      // execute callback for this coldef
      var callback = callback || function(){};
      callback(col);
      return col;
    }
  }
  
  /**
   * remove a column from a griditem
   */
  RockGridItem.prototype.removeColumn = function(field, showWarning) {
    var showWarning = showWarning == null ? true : showWarning;
    var grid = RockGrid.gridItems[this.id];
    var colDefs = grid.gridOptions.columnDefs;
    for(var i=0; i<colDefs.length; i++) {
      var col = colDefs[i];
      if(col.field == field) {
        colDefs.splice(i, 1);
        grid.api().setColumnDefs(colDefs);
      }
    }
    if(showWarning) {
      console.warn("cannot remove column " + field + " because it does not exist in this grid");
    }
  }

  /**
   * set visible columns + order
   */
  RockGridItem.prototype.setColumns = function(columns) {
    var colDefs = RockGrid.gridItems[this.id].gridOptions.columnDefs;
    // first move all columns to the right place
    for(var i=0; i<columns.length; i++) {
      this.columnApi().moveColumn(columns[i], i);
    }

    // then hide all other columns
    for(var i=0; i<colDefs.length; i++) {
      if(columns.indexOf(colDefs[i].field) === -1) {
        this.columnApi().setColumnVisible(colDefs[i].field, false);
      }
    }
  }

  /**
   * convert given column to child column and hide original column
   * @param {string} column 
   * @param {object} options 
   */
  RockGridItem.prototype.makeChild = function(column, options) {
    var options = options || {};

    // get coldef
    var col = this.getColDef(column);
    
    // create copy of object
    var newcol = Object.assign({}, col);

    // overwrite settings
    for(var prop in options) newcol[prop] = options[prop];

    // hide original column
    col.hide = true;

    return newcol;
  }

  /**
   * move column based on field value
   * @param {string} colum 
   * @param {string} where 
   */
  RockGridItem.prototype.moveColumnAfter = function(from, to) {
    var from = typeof from == 'string' ? this.getColDef(from) : from;
    var to = this.getColDef(to);
    var colDefs = this.gridOptions.columnDefs;

    var fromindex;
    var toindex;
    for(var i = 0; i<colDefs.length; i++) {
      if(colDefs[i].field == from.field) fromindex = i;
      if(colDefs[i].field == to.field) toindex = i;
    }

    colDefs.splice(toindex+1, 0, colDefs.splice(fromindex, 1)[0]);
  }

  /**
   * get ajax data
   */
  RockGridItem.prototype.getAjaxData = function() {
    var update = update || false;
    var grid = this;

    // setup the url
    var url = location.href.split('#')[0];
    var href = url.split('?');
    href.push('field=' + grid.id);
    href.push('RockGrid=1');

    // get payload
    href = this.addPayload(href);

    // join string
    href = href.join('&').replace('&','?');

    // do the XHR request
    var xhr = new XMLHttpRequest();
    xhr.open('GET', href, true); // async get request
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.send();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        var httpResult = JSON.parse(xhr.responseText);
        var data = httpResult;

        // if dataset comes from a rockfinder2 we save it to the grid
        // instance and set aggrid rows via data.data attribute
        if(data.name && data.data) {
          grid.RockFinder2 = new _RockFinder2(xhr.responseText);
          data = data.data;
        }

        grid.api().setRowData(data);
        grid.getDOM().dispatchEvent(new Event('RockGridAjaxDone', {bubbles:true}));
      }
    };
  }

  /**
   * add payload to href string for ajax requests
   */
  RockGridItem.prototype.addPayload = function(href) {
    var payload = this.getPayload();

    // loop all properties of the payload object
    for(var prop in payload) {
      var val = payload[prop];

      // add the value or the return value to the href array
      if(typeof val == 'function') href.push(prop + "=" + val());
      else href.push(prop + "=" + val);
    }

    // return the modified href array
    return href;
  }
  
  /**
   * prototype function to get payload for ajax requests
   * this function can be overwritten in the field's javascript setup file
   * see docs for an example
   */
  RockGridItem.prototype.getPayload = function() {
    return {};
  }

  /**
   * reload grid via ajax
   */
  RockGridItem.prototype.reload = function(params) {
    var params = params || {};
    var grid = this;
    
    // show overlay
    if(params.overlay) {
      var el = grid.getDOM();
      var overlay = document.createElement('div');
      el.appendChild(overlay);
      overlay.outerHTML = '<div class="reloadoverlay"></div>';
    }

    // get fresh data
    grid.getAjaxData();
  }
  document.addEventListener('RockGridAjaxDone', function(e) {
    // remove overlay when ajax is done
    var grid = RockGrid.getGrid(e.target);
    var overlay = grid.getDOM().querySelector('.reloadoverlay');
    if(!overlay) return;
    overlay.outerHTML = '';
  });

  /**
   * function to handle ajax calls for this grid
   */
  RockGridItem.prototype.ajax = function(params) {
    var ajax = new RockGridAJAX(this, params);

    // support chaining
    return ajax;
  }
  
  /**
   * register a new plugin for this grid
   * http://krasimirtsonev.com/blog/article/object-oriented-programming-oop-in-javascript-extending-Inheritance-classes
   */
  RockGridItem.prototype.registerPlugin = function(plugin) {
    /* extending */
    function extend(ChildClass, ParentClass) {
      ChildClass.prototype = new ParentClass();
      ChildClass.prototype.constructor = ChildClass;
      return ChildClass;
    }

    var plugin = extend(plugin, RockGridPlugin);
    var Plugin = new plugin(); // init class
    Plugin.grid = this;

    // exit if plugin is disabled
    if(!Plugin.isEnabled()) return;

    // set settings of this plugin
    Plugin.settings = Plugin.getSettings();

    // trigger events for this plugin
    Plugin.onLoad();
    this.getDOM().addEventListener('DOMReady', function() { Plugin.onDomReady(); });
    this.getDOM().addEventListener('RockGridAjaxDone', function() { Plugin.onAjaxDone(); });

    // add plugin to plugins object
    this.plugins[Plugin.name] = Plugin;

    // return plugin instance
    return Plugin;
  }

  /**
   * set plugin settings
   */
  RockGridItem.prototype.pluginSettings = function(name, settings) {
    var plugin = this.plugins[name];
    if(typeof plugin == typeof undefined) plugin = {};
    plugin.settings = settings;
  }

  /**
   * get plugin by name
   * on plugin register this returns the plugin settings
   */
  RockGridItem.prototype.getPlugin = function(name) {
    return this.plugins[name] || null;
  }

  /**
   * enable/disable a plugin
   */
  RockGridItem.prototype.enablePlugin = function(name) { this.plugins[name] = {enabled: true} }
  RockGridItem.prototype.disablePlugin = function(name) { this.plugins[name] = {enabled: false} }

/* ######################### get column data ######################### */

  /**
   * pluck data of this grid
   * 
   * example: RockGrid.gridItems['myGrid'].pluck('id', {filter:false, sort:false});
   */
  RockGridItem.prototype.pluck = function(column, options) {
    var method = 'forEachNode';
    var arr = [];
    var api = this.gridOptions.api;

    // prepare defaults
    var defaults = {
      filter: false, // apply filter (user filter)
      sort: false, // apply sort
      selected: false, // show only selected rows?
      pick: false,
      distinct: false, // return distinct values?
    }

    // merge defaults and options
    var options = Object.assign(defaults, options);

    if(options.filter) method = 'forEachNodeAfterFilter';
    if(options.sort) method = 'forEachNodeAfterFilterAndSort';

    api[method](function(rowNode, index) {
      // if we only want to return selected rows
      // and this row is not selected we skip it
      if(options.selected && !rowNode.isSelected()) return;

      if(options.pick !== false) {
        // skip this row if it does not pass the filter
        // options.pick is a callable function
        if(options.pick(rowNode.data) == false) return;
      }

      // push row to array
      var val = rowNode.data[column];
      if(options.distinct && arr.indexOf(val)>-1) return;
      arr.push(val);
    });
    
    return arr;
  }

/* ######################### column visualisation ######################### */

  /**
   * Hide this column
   */
  RockGridItem.prototype.hide = function(name) {
    var col = this.getColDef(name);
    if(!col) return;
    col.hide = true;
  }

/* ######################### data aggregation ######################### */

  /**
   * return sum of column
   */
  RockGridItem.prototype.sum = function(column, options) {
    return this.pluck(column, options).reduce(function(a, b) { return 1*a+1*b; }, 0);
  }
  
  /**
   * return number of items
   */
  RockGridItem.prototype.count = function(column, options) {
    return this.pluck(column, options).length;
  }

  /**
   * return avg of column
   */
  RockGridItem.prototype.avg = function(column, options) {
    var count = 0;
    var sum = this.pluck(column, options).reduce(function(a, b) {
      count++;
      return 1*a+1*b;
    }, 0);
    return sum/count;
  }

  /**
   * trigger GridItem ready event
   */
  document.dispatchEvent(new Event('RockGridItemReady'));
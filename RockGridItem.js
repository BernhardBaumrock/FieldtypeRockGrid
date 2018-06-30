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
   * get data of this grid
   */
  RockGridItem.prototype.getData = function(params) {
    var arr = [];
    var api = this.gridOptions.api;
    api.forEachNode(function(rowNode, index) {
      arr.push(rowNode.data);
    });
    return arr;
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
      colDefs.push({
        headerName: this.dataColumns[i],
        field: this.dataColumns[i],
        minWidth: 100,

        // this keeps the filter when data is refreshed by ajax
        filterParams: {newRowsAction: 'keep'},

        // don't show filter icon on floating filters by default
        // see https://www.ag-grid.com/javascript-grid-filtering/#floating-filters
        floatingFilterComponentParams: {suppressFilterButton:true},
      });
    }
    return colDefs;
  }
  
  /**
   * get column def by field name
   */
  RockGridItem.prototype.getColDef = function(field) {
    var colDefs = RockGrid.gridItems[this.id].gridOptions.columnDefs;
    for(var i=0; i<colDefs.length; i++) {
      if(colDefs[i].field == field) return colDefs[i];
    }
    console.warn("no coldef found for " + field);
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
   * add column definitions by coldef plugins
   */
  RockGridItem.prototype.addColDefPlugins = function(params) {
    for(var col in params) {
      this.addColDefPlugin(col, params[col]);
    }
  }

  /**
   * get ajax data
   */
  RockGridItem.prototype.getAjaxData = function() {
    var update = update || false;
    var grid = this;
    var url = location.href.split('#')[0];
    var href = url.split('?');
    href.push('field=' + grid.id);
    href.push('RockGrid=1');
    // href.push('action=trash');
    href = href.join('&').replace('&','?');

    var xhr = new XMLHttpRequest();
    xhr.open('GET', href, true); // async get request
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.send();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        var httpResult = JSON.parse(xhr.responseText);
        grid.api().setRowData(httpResult);
        grid.getDOM().dispatchEvent(new Event('RockGridAjaxDone', {bubbles:true}));
      }
    };
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
   * call the related coldef plugin and handover the current coldef
   */
  RockGridItem.prototype.addColDefPlugin = function(col, params) {
    // def can either be a string or an object
    // if it is an object we take the colDef property as name of the colDef plugin
    // if it is a string, that's the name of the colDef plugin to call
    var defName = params.name || params;
    var colDef = this.getColDef(col);
    var coldefFunction = RockGrid.coldefs[defName];
    if(typeof coldefFunction === 'function') coldefFunction(colDef, params);
    else console.warn('No coldef-plugin found for ' + defName);
  }

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

/**
 * Custom Filter Example for RockGrid
 * See https://i.imgur.com/XRnkws7.png for a preview screenshot
 * 
 * To create your own filter just copy this file and rename your filter at the end of each filter class:
 * RockGrid.filters.example = filter; // change to RockGrid.filters.yourfilter
 * RockGrid.filters.exampleFloating = floatingFilter; // change to RockGrid.filters.yourfilterFloating
 * 
 * If your filter is only helpful for you place it in /site/assets/RockGrid/filters/
 * If you think it is helpful for others please share it in the support forum thread or make a PR on gitlab
 * Thank you!
 * 
 * Original agGrid docs:
 * See https://www.ag-grid.com/javascript-grid-filter-component/
 * and https://www.ag-grid.com/javascript-grid-floating-filter-component/
 */

/**
 * example filter
 */
document.addEventListener('RockGridReady', function(e) {

  /**
   * create filter class
   * all methods are mandatory unless they are marked optional
   */
  function filter() {}
  
  /**
   * The init(params) method is called on the filter once.
   * See https://www.ag-grid.com/javascript-grid-filter-component/#ifilter-params
   */
  filter.prototype.init = function (params) {
    console.log(this);
    this.valueGetter = params.valueGetter;
    this.filterText = null;
    this.params = params;
    this.setupGui();
  };

  /**
   * Returns the GUI for this filter. The GUI can be a) a string of html or b) a DOM element or node.
   * In this case we use an optional setupGui method where we pass params in the init() method.
   */
  filter.prototype.getGui = function () {
    return this.gui;
  };

  /**
   * setup the filter gui
   * this method is optional and could be placed inside init()
   * it keeps the code cleaner and better readable
   */
  filter.prototype.setupGui = function () {
    this.gui = document.createElement('div');
    this.gui.innerHTML =
      '<div style="padding: 4px;">' +
      '<div style="font-weight: bold;">Smart search:</div>' +
      '<div><input style="margin: 4px 0px 4px 0px;" type="text" placeholder="Enter..."/></div>' +
      '<div><em>"jo do" will find "John Doe"</div>' +
      '</div>';

    // assign the input element to the filter object
    this.eFilterInput = this.gui.querySelector('input');
    
    // callback that fires on every input change
    // we use RockGrid.debounce() to wait for the user to finish the input and then
    // fire the filter once instead of on every single input
    // RockGrid.debounce(callback(), ms) has a default of 500ms
    // you can set it to 0 and then to 1500 to see how it works (watch the console log)
    var that = this;
    onFilterChanged = RockGrid.debounce(function() {
      console.log('parent filter changed');
      that.filterText = that.eFilterInput.value;
      that.params.filterChangedCallback();
    });

    // add event listener to the filtertext element
    this.eFilterInput.addEventListener("input", onFilterChanged);
  };

  /**
   * check each cell if the filter passes
   */
  filter.prototype.doesFilterPass = function (params) {
    var passed = true;
    var valueGetter = this.valueGetter;
    var value = valueGetter(params);
    if(!value) return false;

    this.filterText.toLowerCase().split(" ").forEach(function(filterWord) {
      if (value.toString().toLowerCase().indexOf(filterWord)<0) {
        passed = false;
      }
    });
  
    return passed;
  };

  /**
   * The grid calls this to know if the filter icon in the header should be shown.
   * Return true to show.
   */
  filter.prototype.isFilterActive = function () {
    return  this.filterText !== null &&
      this.filterText !== undefined &&
      this.filterText !== '';
  };

  /**
   * the filter's model can have any datatype
   * it has all the information the filter needs to execute
   * different filters have different models
   * you can use the filter from the api like this (using the basic text filter here):
   * api.getFilterInstance('yourcolumnid').setModel({type: 'equals', filter: 'yourSearchTerm'});
   * api.onFilterChanged();
   * 
   * getModel and setModel need to share the same datatype to keep all filters in sync
   * that's especially important for floating filters
   */
  filter.prototype.getModel = function () {
    return this.isFilterActive() ? this.eFilterInput.value : null;
  };

  /**
   * set the model for the filter
   * this fires either when the user changes the filter value or when the floating filter changed
   */
  filter.prototype.setModel = function (model) {
    this.eFilterInput.value = model;
    this.filterText = this.eFilterInput.value;
  };

  // attach filter to rockgrid object
  RockGrid.filters.example = filter;
});

/**
 * example floating filter
 */
document.addEventListener('RockGridReady', function(e) {
  
  /**
   * create filter class
   * all methods are mandatory unless they are marked optional
   */
  function floatingFilter() {}

  /**
   * init method
   */
  floatingFilter.prototype.init = function (params) {
    this.onFloatingFilterChanged = params.onFloatingFilterChanged;
    this.setupGui();
  };
  
  /**
   * Returns the GUI
   * same as on parent filter
   */
  floatingFilter.prototype.getGui = function () {
    return this.gui;
  };

  /**
   * setup the GUI
   */
  floatingFilter.prototype.setupGui = function() {
    this.currentValue = null;

    // setup the gui element
    this.gui = document.createElement('div');
    this.gui.innerHTML = '<input placeholder="example.js" type="text"/>'
    this.eFilterInput = this.gui.querySelector('input');

    // filter changed callback
    // see comments for onFilterChanged above for a detailed explanation
    var that = this;
    onInputBoxChanged = RockGrid.debounce(function() {
      console.log('floating filter changed');

      // remove the filter if value is empty
      if (that.eFilterInput.value === '') {
        that.onFloatingFilterChanged(null);
        return;
      }

      // set value and fire callback
      that.currentValue = that.eFilterInput.value;
      that.onFloatingFilterChanged(that.currentValue);
    });

    // add event listener to the inputfield
    this.eFilterInput.addEventListener('input', onInputBoxChanged);
  }

  /**
   * define what happens when the parent model changed
   * this happens when the user used the parent filter and not the floating filter
   */
  floatingFilter.prototype.onParentModelChanged = function (parentModel) {
    var value = !parentModel
      ? '' // if no parent filter we set an empty string
      : parentModel + '' // if parent filter we make sure it is a string
      ;

    // set the value of the input element
    this.eFilterInput.value = value;
    
    // set the current floatingFilter value to the parent's value
    this.currentValue = parentModel;
  };

  // attach filter to rockgrid object
  RockGrid.filters.exampleFloating = floatingFilter;
});

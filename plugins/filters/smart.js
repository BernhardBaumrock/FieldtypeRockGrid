/**
 * smart filter
 * See https://i.imgur.com/ for a preview screenshot
 */

/**
 * smart filter
 */
document.addEventListener('RockGridReady', function(e) {
  function filter() {}
  
  filter.prototype.init = function (params) {
    this.valueGetter = params.valueGetter;
    this.filterText = null; // input field value
    this.type = null; // smart, regex etc
    this.params = params;
    this.setupGui();
  };

  filter.prototype.getGui = function () {
    return this.gui;
  };
  
  filter.prototype.setupGui = function () {
    var lang = RockGrid.str;
    this.gui = document.createElement('div');
    this.gui.innerHTML =
      '<div style="padding: 4px;">' +
        '<div><input style="margin: 4px 0px 4px 0px;" type="text" placeholder="search..."/></div>' +
        '<div style="padding: 7px 0; font-weight: bold;"><input type="radio" name="type" value="smart" checked="checked"> ' + lang.smartSmart + '</div>' +
        '<div><input type="radio" name="type" value="exact"> ' + lang.smartExact + '</div>' +
        '<div><input type="radio" name="type" value="number"> ' + lang.smartNumber + '</div>' +
        '<div><input type="radio" name="type" value="regex"> ' + lang.smartRegex + '</div>' +
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
      //console.log('parent filter changed');
      that.filterText = that.eFilterInput.value;
      that.params.filterChangedCallback();
    });

    // add event listener to the filtertext element
    this.eFilterInput.addEventListener("input", onFilterChanged);

    // check
    var that = this;
    this.gui.addEventListener("click", function(e) {
      var el = e.target;

      var radio = el.nodeName == 'INPUT'
        ? el
        : el.querySelector("input[name=type]");

      if(radio) {
        radio.checked = true;
        that.type = radio.value;
        that.params.filterChangedCallback();
      }
    });
  };

  filter.prototype.doesFilterPass = function (params) {
    var valueGetter = this.valueGetter;
    var cellValue = valueGetter(params);

    var passed;
    var filterText = this.filterText;
    switch(this.type) {
      case 'exact':
        passed = this.filterExact(cellValue, filterText);
        break;

      case 'number':
        passed = this.filterNumber(cellValue, filterText);
        break;
        
      case 'regex':
        passed = this.filterRegex(cellValue, filterText);
        break;
      
      default:
        passed = this.executeFilterBlocks(filterText, params, this.filterSmart);
        break;
    }

    return passed;
  };

  filter.prototype.isFilterActive = function () {
    return  this.filterText !== null &&
      this.filterText !== undefined &&
      this.filterText !== '';
  };

  filter.prototype.getModel = function () {
    return this.isFilterActive() ? this.eFilterInput.value : null;
  };

  filter.prototype.setModel = function (model) {
    this.eFilterInput.value = model;
    this.filterText = this.eFilterInput.value;
  };

  /**
   * filter methods and helpers
   */

    // Smart filter
    filter.prototype.filterSmart = function(cellValue, filterText) {
      if(!filterText) return true;
      var cellValueString = !cellValue ? '' : cellValue.toString();

      // shortcuts
      if(filterText == '.') return cellValueString != ''; // non-empty
      if(filterText == '!') return cellValueString == ''; // empty

      return cellValue.toString().toLowerCase().indexOf(filterText) >= 0;
    }
    
    // Exact filter
    filter.prototype.filterExact = function(cellValue, filterText) {
      return cellValue.toString().toLowerCase() == filterText.toString().toLowerCase();
    }
    
    // Number filter
    filter.prototype.filterNumber = function(cellValue, filterText) {
      return passed;
    }
    
    // Regex filter
    filter.prototype.filterRegex = function(cellValue, filterText) {
      var passed = false;
      return passed;
    }

    /**
     * get filter blocks
     * @param {string} filterText 
     * @param {object} params 
     * @param {callback} filterFunction 
     * 
     * this splits up the filterText into multiple blocks and returns the overall return value
     * currently it does only support one type of comparison, either AND or OR, not both
     * space = AND, | = OR
     * 
     * this could be extended to support comparison groups, eg "<0 | (>10 <20)"
     * even better this could be made recursive, eg "<0 | ((>10 <20) | (>=50 <=60))"
     * should support "this|that" and "this | that" syntax
     */
    filter.prototype.executeFilterBlocks = function(filterText, params, filterFunction) {
      var passed;
      var valueGetter = this.valueGetter;
      var cellValue = valueGetter(params);

      //console.log('executeFilterBlocks');

      // execute or-groups
      if(filterText.indexOf("|") > 0) {
        passed = false;
        //console.log('---or---');
        filterText.split("|").forEach(function(filterWord) {
          //console.log('block, word = ' + filterWord);
          var blockPassed = filterFunction(cellValue, filterWord.trim());
          if(blockPassed) passed = true;
        });
      }

      // execute and-groups
      else if(filterText.indexOf(" ") > 0) {
        passed = true;
        //console.log('---and---');
        filterText.split(" ").forEach(function(filterWord) {
          //console.log('block, word = ' + filterWord);
          var blockPassed = filterFunction(cellValue, filterWord.trim());
          if(!blockPassed) passed = false;
        });
      }

      // single string
      else {
        passed = false;
        return filterFunction(cellValue, filterText);
      }

      // filterText.toLowerCase().split(" ").forEach(function(filterWord) {
      ////   console.log(filterWord);
      // });

      return passed;
    }

  // attach filter to rockgrid object
  RockGrid.filters.smart = filter;
});

/**
 * smart floating filter
 */
document.addEventListener('RockGridReady', function(e) {
  function floatingFilter() {}
  
  floatingFilter.prototype.init = function (params) {
    this.onFloatingFilterChanged = params.onFloatingFilterChanged;
    this.setupGui();
  };
  
  floatingFilter.prototype.getGui = function () {
    return this.gui;
  };

  floatingFilter.prototype.setupGui = function() {
    this.currentValue = null;

    // setup the gui element
    this.gui = document.createElement('div');
    this.gui.innerHTML = '<input placeholder="Filter..." type="text"/>'
    this.eFilterInput = this.gui.querySelector('input');

    // filter changed callback
    // see comments for onFilterChanged above for a detailed explanation
    var that = this;
    onInputBoxChanged = RockGrid.debounce(function() {
      //console.log('floating filter changed');

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
  RockGrid.filters.smartFloating = floatingFilter;
});

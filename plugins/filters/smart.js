/**
 * smart filter
 * See https://i.imgur.com/ for a preview screenshot
 * 
 * todo:
 * - style border of floating filter differently for each filter type
 *   if one uses the doubleclickfilter the filter is set to "exact" and that might
 *   not be recognized by the user
 * - add support for = and != on text filters, eg !=foo !=bar, =foo | =bar
 */

/**
 * smart filter
 */
document.addEventListener('RockGridReady', function(e) {
  function filter() {}
  function floatingFilter() {}

  /**
   * shared functions
   */
  var setInputStyle = function(model, el) {
    if(!model) return;

    // reset border
    el.style.border = null;

    // make border orange on all non-default filtertypes
    if(model.type != 'smart') {
      el.style.border = '1px solid orange';
    }

    // check for valid regex
    if(model.type == 'regex') {
      try {
        var regex = new RegExp(model.value, 'gi');
      } catch(e) {
        // invalid regex!
        el.style.border = '1px solid red';
      }
    }
  }
  
  /**
   * methods for the filter class
   */

  filter.prototype.init = function (params) {
    RockGrid.filters.smartFilterOperands = '(<=|>=|<|>|=|!=)';

    this.name = 'smartFilter';
    this.valueGetter = params.valueGetter;
    this.filterText = null; // input field value
    this.defaultType = 'smart'; // default filter type: smart, regex etc
    this.type = this.defaultType;
    this.regex = '';
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
        '<div><input type="text" placeholder="" class="filterText" /></div>' +
        '<div style="padding: 7px 0; font-weight: bold;"><input type="radio" name="type" class="filterType" value="smart"> ' + lang.smartSmart + '</div>' +
        '<div><input type="radio" name="type" class="filterType" value="exact"> ' + lang.smartExact + '</div>' +
        '<div><input type="radio" name="type" class="filterType" value="number"> ' + lang.smartNumber + '</div>' +
        '<div><input type="radio" name="type" class="filterType" value="regex"> ' + lang.smartRegex + '</div>' +
      '</div>';

    // check the default radio
    this.checkRadio();

    // assign the input element to the filter object
    this.eFilterInput = this.gui.querySelector('input');
    
    // callback that fires on every input change
    // we use RockGrid.debounce() to wait for the user to finish the input and then
    // fire the filter once instead of on every single input
    // RockGrid.debounce(callback(), ms) has a default of 500ms
    // you can set it to 0 and then to 1500 to see how it works (watch the console log)
    var that = this;
    onFilterChanged = RockGrid.debounce(function() {
      that.filterText = that.eFilterInput.value;
      
      // style the inputfield
      setInputStyle(that.getModel(), that.eFilterInput);

      that.params.filterChangedCallback();
    });

    // add event listener to the filtertext element
    this.eFilterInput.addEventListener("input", onFilterChanged);

    // handle radio click events
    var that = this;
    this.gui.addEventListener("click", function(e) {
      var el = e.target;

      // what was clicked? the radio itself or the label?
      var radio = el.className == 'filterType'
        ? el
        : el.querySelector(".filterType");
      if(!radio) return;

      // a radio was checked
      // set the new model
      that.setModel({
        value: that.eFilterInput.value,
        type: radio.value,
      });

      that.params.filterChangedCallback();
    });
  };

  /**
   * check the correct radiobutton based on the current model
   */
  filter.prototype.checkRadio = function() {
    var type = this.type;
    var radiobutton = this.gui.querySelector('input[value="' + this.type + '"]');
    if(radiobutton) radiobutton.checked = true;
  }

  filter.prototype.doesFilterPass = function (params) {
    return this.executeFilterBlocks(params);
  };

  filter.prototype.isFilterActive = function () {
    return  this.filterText !== null &&
      this.filterText !== undefined &&
      this.filterText !== '';
  };

  filter.prototype.getModel = function () {
    // setup the model object
    var model = {
      value: this.eFilterInput.value,
      type: this.type || this.defaultType,
    };
    return model;
  };

  /**
   * actions that are done when the model is updated
   */
  filter.prototype.setModel = function (model) {
    if(!model) model = {}
    model.type = model.type || this.defaultType;
    model.value = model.value || '';

    // set the filter inputfield value
    this.eFilterInput.value = model.value;

    // set filterText property of current filter class
    this.filterText = this.eFilterInput.value;

    // set filter type and radiobutton
    this.type = model.type;
    this.checkRadio();
    setInputStyle(this.getModel(), this.eFilterInput);
  };

  /**
   * update the model's value when the floating filter is changed
   */
  filter.prototype.onFloatingFilterChanged = function(value) {
    var model = this.getModel() || {};
    model.value = value;
    this.setModel(model);
    this.params.filterChangedCallback();
  }

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

      return cellValueString.toLowerCase().indexOf(filterText.toLowerCase()) >= 0;
    }
    
    // Exact filter
    filter.prototype.filterExact = function(cellValue, filterText) {
      var cellValueString = !cellValue ? '' : cellValue.toString();
      return cellValueString.toLowerCase() == filterText.toString().toLowerCase();
    }
    
    // Number filter
    filter.prototype.filterNumber = function(cellValue, filterText) {
      var val = Number(cellValue);
      if(!val) return false;

      // parse number from string
      // we create a regex based on the operands + spaces + any other digits that should be the number
      var regex = new RegExp(RockGrid.filters.smartFilterOperands+'[\s]*(.*)', 'gm');
      let m;
      while ((m = regex.exec(filterText)) !== null) {
          // This is necessary to avoid infinite loops with zero-width matches
          if (m.index === regex.lastIndex) regex.lastIndex++;
          
          var operator = m[1];
          var number = parseFloat(m[2]);
      }

      if(operator == '<') return val < number;
      if(operator == '>') return val > number;
      if(operator == '<=') return val <= number;
      if(operator == '>=') return val >= number;
      if(operator == '=') return val == number;
      if(operator == '!=') return val != number;
      
      return false;
    }
    
    // Regex filter
    filter.prototype.filterRegex = function(cellValue, filterText) {
      var cellValueString = !cellValue ? '' : cellValue.toString();

      try {
        var regex = new RegExp(filterText, 'gi');
      } catch(e) {
        // invalid regex!
        return false;
      }

      return cellValueString.match(regex);
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
    filter.prototype.executeFilterBlocks = function(params) {
      var passed;
      var filterText = this.filterText;
      var valueGetter = this.valueGetter;
      var cellValue = valueGetter(params);
      var filterFunction;

      // dont split blocks on exact and regex filter
      if(this.type === 'exact') return this.filterExact(cellValue, filterText);
      if(this.type === 'regex') return this.filterRegex(cellValue, filterText);

      // execute or-groups
      if(filterText.indexOf("|") > 0) {
        passed = false;
        var that = this;
        filterText.split("|").forEach(function(filterWord) {
          filterFunction = that.getFilterFunction(filterWord);
          var blockPassed = filterFunction(cellValue, filterWord.trim());
          if(blockPassed) passed = true;
        });
      }

      // execute and-groups
      else if(filterText.indexOf(" ") > 0) {
        passed = true;
        var that = this;
        filterText.split(" ").forEach(function(filterWord) {
          filterFunction = that.getFilterFunction(filterWord);
          var blockPassed = filterFunction(cellValue, filterWord.trim());
          if(!blockPassed) passed = false;
        });
      }

      // single string
      else {
        passed = false;
        filterFunction = this.getFilterFunction(filterText);
        return filterFunction(cellValue, filterText);
      }

      return passed;
    }

    /**
     * find the proper filter function for the given expression
     * @param {string} filterExpression 
     * 
     * for example this returns the numberFilter if the expression has a leading < or > etc
     */
    filter.prototype.getFilterFunction = function(filterExpression) {
      // if the filtertype is set manually return this type
      switch(this.type) {
        case 'exact': return this.filterExact;
        case 'number': return this.filterNumber;
        case 'regex': return this.filterRegex;
      }

      // remove leading spaces
      filterExpression = filterExpression.trim();

      // check for number filter
      var regex = new RegExp('^' + RockGrid.filters.smartFilterOperands, 'gm');
      if(filterExpression.match(regex)) return this.filterNumber;

      // return the smart filter by default
      return this.filterSmart;
    }

  /**
   * methods for the floating filter class
   */

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
    this.gui.innerHTML = '<input placeholder="" type="text"/>'
    this.eFilterInput = this.gui.querySelector('input');

    // filter changed callback
    // see comments for onFilterChanged above for a detailed explanation
    var that = this;
    onInputBoxChanged = RockGrid.debounce(function() {

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
    if(!parentModel) return;

    var value = '';
    if(parentModel && parentModel.value) value = parentModel.value + '';

    // set the value of the input element
    this.eFilterInput.value = value;
    
    // set the current floatingFilter value to the parent's value
    this.currentValue = parentModel;

    setInputStyle(parentModel, this.eFilterInput);
  };

  // attach filter to rockgrid object
  RockGrid.filters.smart = filter;
  RockGrid.filters.smartFloating = floatingFilter;
});

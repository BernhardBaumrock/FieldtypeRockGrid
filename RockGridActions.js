// add methods to grid item
$(document).on('RockGridItemReady', function() {
  /**
   * Add an action to this grid
   */
  RockGridItem.prototype.addAction = function(action) {
    action.grid = this;
    this.actions[action.name] = action;
  }

  /**
   * Find action by name and return it
   */
  RockGridItem.prototype.getAction = function(name) {
    return this.actions[name] || false;
  }
  
  /**
   * Get selected action
   */
  RockGridItem.prototype.getSelectedAction = function() {
    var $gui = this.getActionsGui();
    if(!$gui.length) return;
    return this.getAction($gui.find(".RockGridActionSelect").val());
  }
  
  /**
   * Get actions GUI for this grid
   */
  RockGridItem.prototype.getActionsGui = function() {
    var $gui = $('.RockGridActionsGui [data-grid='+this.id+']').closest('.RockGridActionsGui');
    if(!$gui.length) return;
    return $gui;
  }
});

// load all actions
$(document).on('RockGridItemAfterInit', function(e) {
  // get grid, init actions object and trigger event for loading all actions
  var grid = RockGrid.getGrid(e.target);
  grid.actions = {};
  $(document).trigger('RockGridActionLoad', grid);
});


// show number of entries on each grid change
$(document).on('RockGridItemAfterInit', function(e) {
  var grid = RockGrid.getGrid(e.target);
  
  // function that updates the row count entries
  var showCount = RockGrid.debounce(function() {
    var $actionsGui = grid.getActionsGui();
    if(!$actionsGui) return; // ajax loaded fields

    // update cnt fields
    $.each($actionsGui.find('.RockGridActionRows'), function() {
      if($(this).val() == 'none') return;
      var $cnt = $(this).next().find('span.cnt');
      if(!$cnt.length) {
        $cnt = $('<span class="cnt uk-margin-small-left"></span>');
        $(this).next().append($cnt);
      }
      $cnt.text('(' + grid.getIds($(this).val()).length + ')');
    });
  });

  // listen for changes to the grid
  grid.api().addEventListener('selectionChanged', showCount);
  grid.api().addEventListener('filterChanged', showCount);
  grid.api().addEventListener('rowDataChanged', showCount);
  $(document).ajaxComplete(showCount);

  // listen to clicks on the execute button
  $(document).on('click', '.rockgridactions-execute', function() {
    // get action and execute it
    var action = grid.getSelectedAction();
    if(action) action.execute();
    else vex.dialog.alert('Please select an action to execute!');
  });
});

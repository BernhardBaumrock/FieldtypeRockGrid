/**
 * single button for buttons plugin
 */
var RockGridButton = function(params) {
  this.params = params;

  /**
   * render this button
   */
  this.render = function() {
    var params = this.params;
    var out = '';

    out += "<a href='#' ";
    out += params.class ? params.class : "class='rockgridbutton ui-button ui-priority-secondary ui-button-small ui-widget ui-state-default ui-corner-all ";
    out += params.showWhenSelected ? 'showWhenSelected ' : '';
    out += params.name + ' ';
    out += params.addClass ? params.addClass + ' ' : ' ';
    out += "' onclick='return RockGridButtonClick(this)'";
    out += " data-name='" + params.name + "'";
    out += params.hover ? " title='" + params.hover + "'" : '';
    out += ">";
    out += params.icon ? "<i class='fa " + params.icon + "'></i>" : "";
    out += params.label || '';
    out += "</a>";

    return out;
  }

  /**
   * click action for this button
   */
  this.onClick = function(node) {
    if(this.params.onClick) this.params.onClick(node);
  }
}

/**
 * show action buttons on top right corner of this grid
 */
document.addEventListener('RockGridItemLoadPlugins', function(e) {
  var buttonsPlugin = RockGrid.getGrid(e.target).registerPlugin(function() {
    this.name = 'buttons';

    // array holding all buttons
    this.buttons = [];

    // dom element where buttons are rendered
    this.el;

    this.onLoad = function() {
      // create dom element for buttons
      var wrapper = this.grid.getWrapperDOM();
      var el = document.createElement('div');
      wrapper.insertBefore(el, wrapper.firstChild);
      el.outerHTML = "<div class='rockgridbuttons'><small></small></div>";
      this.el = wrapper.querySelector('.rockgridbuttons small');
    }
  
    /**
     * render buttons
     */
    this.render = function() {
      var out = '';
      for(var i=0; i<this.buttons.length; i++) {
        out += this.buttons[i].render();
      }
      this.el.innerHTML = out;
    }

    /**
     * add a button
     */
    this.add = function(button, before, after) {
      var before = before || null;
      var after = after || null;

      // create button from settings object
      var Button = new RockGridButton(button);

      // add button
      // todo: at right position (before, after)
      this.buttons.push(Button);

      this.render();
    }

    /**
     * remove a button
     */
    this.remove = function(name) {
      var index = this.getButton(name, true);
      if(index === false) {
        console.warn('Button ' + name + ' not found');
        return; // wrong button name, dont remove anything
      }
      this.buttons.splice(index, 1);
      this.render();
    }

    /**
     * get button instance
     */
    this.getButton = function(name, returnIndex) {
      var returnIndex = returnIndex || false;
      for(var i=0; i<this.buttons.length; i++) {
        var button = this.buttons[i];
        if(button.params.name == name) return returnIndex ? i : button;
      }
      return false;
    }
  });

  // the plugin is loaded, now we can load all buttons
  e.target.dispatchEvent(new CustomEvent(
    'RockGridItemLoadButtons', {
      bubbles: true,
      detail: buttonsPlugin,
  }));
});

/**
 * handle button clicks
 */
var RockGridButtonClick = function(el) {
  var Button = RockGrid.getGrid(el).plugins.buttons.getButton(el.getAttribute('data-name'));
  Button.onClick(el);
  return false;
}

/**
 * hide or show buttons that are only visible when rows are selected
 * todo: make non-jquery version
 */
document.addEventListener('RockGridItemAfterInit', function(e) {
  var grid = RockGrid.getGrid(e.target);
  var $button = $(grid.getWrapperDOM()).find('.rockgridbutton.showWhenSelected');
  $button.hide().removeClass('showWhenSelected'); // this fixes hidden button padding issue
  var selectiontimer;
  var fadeButtons = function(delay) {
    clearTimeout(selectiontimer);
    selectiontimer = setTimeout(function() {
      if(grid.api().getSelectedRows().length) $button.fadeIn();
      else {
        if(delay) $button.fadeOut();
        else $button.hide();
      }
    }, delay); // delay to wait for doubleclick events
  };
  grid.api().addEventListener('modelUpdated', function(e) { fadeButtons(0); });
  grid.api().addEventListener('selectionChanged', function(e) { fadeButtons(500); });
});
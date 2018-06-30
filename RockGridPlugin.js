/* base class */
var RockGridPlugin = function() {
  // the plugin's name
  this.name = 'RockGridPlugin';

  // plugins are enabled by default
  this.enabled = true;
  this.isEnabled = function() {
    // if the plugin is enabled/disabled for this grid we return this value
    // otherwise we return the default state of the plugin
    var plugin = this.grid.plugins[this.name];
    if(typeof plugin == typeof undefined) return this.enabled;
    return plugin.enabled;
  }

  // get settings for this plugin
  this.getSettings = function() {
    var plugin = this.grid.plugins[this.name];
    if(typeof plugin == typeof undefined) return {};
    return plugin.settings;
  }

  // set settings for this plugin
  this.setSettings = function(params) {
    for(setting in params) {
      this.settings[setting] = params[setting];
    }
  }
};

/**
 * event callbacks for a plugin
 */
RockGridPlugin.prototype.onLoad = function() {};
RockGridPlugin.prototype.onDomReady = function() {};
RockGridPlugin.prototype.onAjaxDone = function() {};
# Plugin docs

## Enabling/disabling a plugin

If the default state of the plugin does not match your needs you can enable/disable your plugin before init:

```js
document.addEventListener('RockGridItemBeforeInit', function(e) {
  if(e.target.id != 'RockGridItem_yourgridid') return;
  var grid = RockGrid.getGrid(e.target.id);
  
  grid.disablePlugin('yourPluginName');
  grid.enablePlugin('yourPluginName');
});
```

## Setting options for plugins

Option 1: Set settings before grid init:

```js
document.addEventListener('RockGridItemBeforeInit', function(e) {
  if(e.target.id != 'RockGridItem_ratings') return;
  var grid = RockGrid.getGrid(e.target.id);
  
  grid.enablePlugin('colStats');
  grid.pluginSettings('colStats', {
    values: {
      col1: function(column) {
        return grid.sum(column);
      },
      col2: function(column) {
        return null;
      },
      col3: function(column) {
        return grid.api().getSelectedRows().length;
      },
    },
    render: {
      col3: function(value) {
        return "<strong>Selected rows:</strong> " + value;
      },
    },
  });
});
```

Option 2: Set options after grid init (for buttons plugins):

```js
```

## Creating custom plugins

Creating custom plugins is quite simple, just place a javascript file in the  `/site/assets/RockGrid/plugins/` folder.
If you think your plugin might be of broader use please make a pull request to add your plugin to the repository or
share your plugincode in the forum.

```js
/**
 * plugin description: this is a sample plugin for RockGrid
 */
document.addEventListener('RockGridItemLoadPlugins', function() {
  RockGrid.registerPlugin(function() {
    this.name = 'helloWorld';
    this.enabled = true; // default

    this.myProperty = 'hello world';

    this.myMethod = function() {
      console.log('hello world');
    }

    this.onLoad = function() {
      console.log('hello world onLoad!');
    }

    this.onDomReady = function() {
      console.log('dom is ready for ' + this.name);
    }
  });
  
  /**
   * ##################### backend event listeners #####################
   */
  if(!RockGrid.backend) return;

  // field opened
  $(document).on('opened', 'li', function(e) {
    var $li = $(e.target);
    if(!$li.find('.RockGridItem').length) return;
    console.log('a field with a RockGrid was opened!');
  });
});
```

## Get a plugin of a grid


```js
document.addEventListener('RockGridItemAfterInit', function(e) {
  if(e.target.id != 'RockGridItem_yourgridid') return;
  var grid = RockGrid.getGrid(e.target.id);
  
  var Plugin = grid.plugins['yourPluginName'];
});
```
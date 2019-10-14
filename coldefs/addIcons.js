/**
 * add clickable icon to current cell
 * @param {object} col 
 * @param {array} items, array of icon-configs
 */
document.addEventListener('RockGridReady', function(e) {
  RockGrid.colDefs.addIcons = function(col, items, options) {
    var options = options || {};

    // get settings
    var adjustWidth = options.adjustWidth || true;

    // get the current cellRenderer where we prepend/append the icon
    var renderer = col.cellRenderer || function(params) { return params.value || ''; };

    // function to get the return value of a string with tags or a callback function
    // /this/is/an/{id}/example would be /this/is/an/123/example
    // function(params) { return '/this/is/an/' + params.data.id + '/example' }
    var getValue = function(value, params) {
      if(typeof value == 'function') return value(params);
      return RockGrid.replaceTags(value || '', params);
    }

    // add the new renderer
    col.cellRenderer = function(params) {
      // loop all icons
      var str = '';
      var before = '';
      var after = '';
      for(var i=0; i<items.length; i++) {
        var item = items[i];
        str = '';

        // check if filter for this icon passes
        var filter = item.filter || function() { return true; }
        if(filter(params) !== true) continue;
    
        // setup parameters
        var icon = item.icon || 'search';                                   // icon
        var type = item.type || 'after';                                    // show icon before or after the content
        var show = item.show || 'always';                                   // show always or only on hover
        var target = item.target || '_blank';                               // link target

        var cls = getValue(item.cls, params);                               // link class
        var href = getValue(item.href, params);                             // href of the link
        var dataHref = getValue(item.dataHref, params);                     // will be populated later
        var label = getValue(item.label || icon, params);                   // link label
  
        // early exit if a tag had no value
        if(!href && !dataHref) continue;
  
        // if we have a data-href attribute we set the regular href attribute to that value
        // this is needed to support middle-click (open in new tab) feature
        if(!href) href = dataHref || '#';
        
        // setup the string
        str += '<a';
        str += ' href="' + href + '"';
        str += ' target="' + target + '"';
        str += ' title="' + label + '"';
        str += ' class="' + cls + '"';
        str += ' data-href="' + dataHref + '"';
        str += '>';
          str += '<i class="';
          str += 'fa fa-' + icon; // add icon classes
          str += ' rgActionIcon rgActionIcon-' + type; // add type classes
          str += ' rgActionIcon-' + show; // add hover class
          str += '"></i>';
        str += '</a>'; //params.data.id;
  
        // prepend/append the markup
        if(type == 'after') after += str;
        else before += str;
      }

      // return all markup
      if(params.value === false) return '';
      return before + renderer(params) + after;
    }

    // finally adjust the cell width
    if(options.width) col.width = options.width;
    else if(adjustWidth) col.width = col.width + 23*items.length;

    return col;
  };
});

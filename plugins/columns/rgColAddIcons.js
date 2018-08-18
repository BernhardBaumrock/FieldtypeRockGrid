/**
 * add clickable icon to current cell
 * @param {object} col 
 * @param {array} items, array of icon-configs
 */
var rgColAddIcons = function(col, items) {
  // get the current cellRenderer where we prepend/append the icon
  var renderer = col.cellRenderer || function(params) { return params.value; };

  // apply prepend and append markup
  col.cellRenderer = function(params) {
    // console.log(params);

    // loop all icons
    var str = '';
    var before = '';
    var after = '';
    for(var i=0; i<items.length; i++) {
      var item = items[i];
      str = '';
  
      // setup parameters
      var icon = item.icon || 'search';                                   // icon
      var type = item.type || 'after';                                    // show icon before or after the content
      var href = RockGrid.replaceTags(item.href || '#', params);          // href of the link
      var show = item.show || 'always';                                   // show always or only on hover
      var dataHref = RockGrid.replaceTags(item.dataHref || '', params);   // data-href attribute for pw-panels
      var target = item.target || '_blank';                               // link target
      var label = item.label || icon;                                     // link label
      var cls = RockGrid.replaceTags(item.cls || '', params);             // link class

      // early exit if a tag had no value
      if(href === false || dataHref === false) continue;
      
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
    return before + renderer(params) + after;
  }

  return col;
}
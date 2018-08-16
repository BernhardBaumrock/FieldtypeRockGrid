/**
 * add clickable icon to current cell
 * @param {object} col 
 * @param {object} params, see possible options and defaults in the code
 */
var rgColAddIcons = function(col, items) {
  // get the current cellRenderer where we prepend/append the icon
  var renderer = col.cellRenderer || function(params) { return params.value; };

  // replace tags by value of the current row
  var replaceTags = function(str, params) {
    var result = str.match(/{(.*?)}/g);
    if(!result) return str;

    // replace tags
    var notfound = false;
    result.map(function(val) {
      var field = val.replace(/{|}/g,'');
      str = str.replace(val, params.data[field]);
      if(params.data[field] == null) notfound = true;
    });

    // don't show icon if a tag's value was null
    if(notfound) return false;
    return str;
  }

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
      var icon = item.icon || 'search';                             // icon
      var type = item.type || 'after';                              // show icon before or after the content
      var href = replaceTags(item.href || '#', params);             // href of the link
      var show = item.show || 'always';                             // show always or only on hover
      var dataHref = replaceTags(item.dataHref || '', params);      // data-href attribute for pw-panels
      var target = item.target || '_blank';                         // link target
      var label = item.label || icon;                               // link label
      var cls = item.cls || '';                                     // link class

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
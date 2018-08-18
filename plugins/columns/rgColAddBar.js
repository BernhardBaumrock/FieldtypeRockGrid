/**
 * add colored bar to current cell
 * @param {object} col 
 * @param {object} bar, bar config
 */
var rgColAddBar = function(col, bar) {
  // get the current cellRenderer where we prepend/append the icon
  var renderer = col.cellRenderer || function(params) { return params.value; };

  // get bar markup
  var getBarMarkup = function(bar, params) {
    var html = '';

    // setup parameters
    var cls = RockGrid.replaceTags(bar.cls || '', params);             // class
    var style = RockGrid.replaceTags(bar.style || '', params);         // style

    // setup bar
    html += '<span class="';
        html += 'rgBar rgBar-' + bar.position;
        html += ' ' + cls + '"';
      html += ' style="' + style + '"';
    html += '></span>';

    return html;
  }

  // apply prepend and append markup
  col.cellRenderer = function(params) {
    var html = '';
    var type = bar.type || 'simple';

    // simple bar
    if(type == 'simple') {
      html += getBarMarkup(bar, params);
    }

    // partOfTotal bar
    if(type == 'partOfTotal') {
      var val;

      // total bar
      bartotal = Object.create(bar.total);
      bartotal.position = bar.position;
      val = parseInt(bartotal.val(params));
      if(val) html += getBarMarkup(bartotal, params);

      // part bar
      barpart = Object.create(bar.part);
      barpart.position = bar.position;
      barpart.cls += ' rgBarPart';
      val = parseInt(barpart.val(params));
      if(val) {
        barpart.style = (barpart.style||'') + ' width: ' + val + '%;';
        html += getBarMarkup(barpart, params);
      }
    }
    

    // return all markup
    return renderer(params) + html;
  }

  return col;
}
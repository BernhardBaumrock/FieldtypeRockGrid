/**
 * this plugin shows additinal data when hovering over a cell in the grid
 * custom markup of additional info can easily be defined
 */


// /**
//  * cell hover info plugin
//  */

// // add the plugin to the config objects
// document.addEventListener('RockGridReady', function() {
//   RockGrid.registerPlugin('cellHoverInfo');
//   RockGrid.plugins.cellHoverInfo.enabled = false;
// });

// // plugin logic
// document.addEventListener('DOMReady', function(e) {
//   // add the tooltip to the document
//   var div = document.createElement('div');
//   div.setAttribute('id', 'cellHoverInfo');
//   document.body.appendChild(div);
// });

// // event listener
// document.addEventListener('RockGridPluginReady.cellHoverInfo', function(e) {
//   var grid = RockGrid.getGrid(e.target.id);
//   var plugin = grid.plugins.cellHoverInfo;
//   if(!plugin.isEnabled()) return;

//   if(typeof plugin.render == 'undefined') {
//     // add the default callback to the gridItem
//     plugin['render'] = function(e) {
//       // just for demonstration
//       // var colId = e.column.colId;
//       // var value = e.value;

//       var data = e.data;
//       var html = '';
//       for(var key in data) {
//         html += key + ': ' + data[key] + '<br>';
//       }
//       return html;
//     };
//   }

//   // add eventlisteners
//   var addListeners = function() {
//     var el = document.getElementById('cellHoverInfo');
//     var timer;
//     var delay = 500;

//     // show tooltip on cell hover
//     grid.api().addEventListener('cellMouseOver', function(e) {
//       // set html to the plugin's callback function
//       clearTimeout(timer);
//       timer = setTimeout(function() {
//         var html = plugin.render(e);
//         if(!html) {
//           el.style.display = 'none';
//         }
//         else {
//           el.innerHTML = html;
//           el.style.display = 'block';
//         }
//       }, delay);
//     });

//     // hide tooltip on mouseout
//     grid.api().addEventListener('cellMouseOut', function(e) {
//       clearTimeout(timer);
//       timer = setTimeout(function() {
//         el.style.display = 'none';
//       }, delay);
//     });

//     // update info html when cell is clicked (row selected)
//     grid.api().addEventListener('cellClicked', function(e) {
//       el.innerHTML = plugin.render(e);
//     });
//   };

//   // add listeners when dom is ready
//   var el = document.getElementById('cellHoverInfo');
//   if(!el) document.addEventListener('DOMReady', function(e) { addListeners() });
//   else addListeners();
// });

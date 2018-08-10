document.addEventListener('RockGridReady', function(e) {
  // load currency.js
  currency = document.createElement('script');
  currency.setAttribute('src','/site/modules/FieldtypeRockGrid/lib/currency.min.js');
  document.head.appendChild(currency);

  /**
   * here we define different presets for currencies
   * if you need any more please make a pull request
   */
  var presets = {
    euro: { separator: ".", decimal: ",", symbol: "€", formatWithSymbol: false },
  }

  /**
   * define the renderer
   * it returns a formatted currency
   */
  RockGrid.renderers.currency = function(params) {
    return params.prepend + currency(params.value, params.settings || presets[params.preset]).format() + params.append;
  };
});
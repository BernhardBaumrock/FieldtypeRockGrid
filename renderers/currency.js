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
    // if just a number was submitted we convert it to an object
    // this way you can easily format a number to a currency like this: RockGrid.renderers.currency(123);
    if(typeof params != 'object') params = {value: params, preset: 'euro', append: ' €' }

    // if hidenull setting is true we return an empty string
    if(params.hideEmpty && !params.value) return ''; // this also hides 0.00 values
    if(params.hideNull && params.value === null) return ''; // this only hides NULL values

    // return currency string
    return (params.prepend||'') + currency(params.value, params.settings || presets[params.preset]).format() + (params.append||'');
  };
});
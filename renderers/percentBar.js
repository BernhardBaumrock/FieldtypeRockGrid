document.addEventListener('RockGridReady', function(e) {
  RockGrid.renderers.percentBar = function(params, str, digits) {
    str = str || '';
    digits = digits || 0;
    var value = params.value;
    if(typeof value != 'number') return str;

    var eDivPercentBar = document.createElement('div');
    eDivPercentBar.className = 'div-percent-bar';
    eDivPercentBar.style.width = value + '%';
    if (value < 20) {
        eDivPercentBar.style.backgroundColor = '#f44336';
    } else if (value < 60) {
        eDivPercentBar.style.backgroundColor = '#FF9100';
    } else {
        eDivPercentBar.style.backgroundColor = '#4CAF50';
    }

    var eValue = document.createElement('div');
    eValue.className = 'div-percent-value';
    eValue.innerHTML = value.toFixed(digits) + '%' + str;

    var eOuterDiv = document.createElement('div');
    eOuterDiv.className = 'div-outer-div';
    eOuterDiv.appendChild(eDivPercentBar);
    eOuterDiv.appendChild(eValue);

    return eOuterDiv.outerHTML;
  };
});

define(
['jquery'],
'grid',
function($){

var grid = {
  vu: 22,
  em: 14,
  ems: function(n){ return this.em * n; },
  vus: function(n){ return this.vu * n; },
};

$.extend(grid, {
  wMax: grid.ems(18),
  hMax: grid.vus(2),
  hGap: grid.em,
  vGap: grid.vu,
  hPad: grid.em / 2,
  vPad: grid.vu / 4,
});

return grid;
});

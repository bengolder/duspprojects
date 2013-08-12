// name space!
var app = app || {};


app.grid = {
  vu: 22,
  em: 14,
  ems: function(n){ return this.em * n; },
  vus: function(n){ return this.vu * n; },
};

function trans(x, y) {
  return "translate("+x+","+y+")";
}

app.brickView = {

  // the brick size
  maxWidth: app.grid.ems(18),
  maxHeight: app.grid.vus(2),
  horizontalGap: app.grid.em,
  verticalGap: app.grid.vu,
  horizontalPadding: app.grid.em / 2,
  verticalPadding: app.grid.vu / 4,

  calculatePositions: function(){
    // for each object, pick a point on the grid
    // use a standard object height
    var pos = {x: 0, y: this.verticalGap};

    for (var i = this.nodes.length; i; i -= 1) {

      // do something can I measure characters?
      // over a certain amount, I can assume it should be max width;
      var node = this.nodes[i - 1];
      console.log(node);
      var text = node.displayText;

      // set default height and width of block
      // make sure the width is in ems
      node.block = {
        x: app.grid.ems(Math.ceil(text.length / 1.6)),
        y: app.grid.vu,
      };

      console.log("block", node.block);

      // adjust the height and width based on character count
      if (node.block.x > this.maxWidth) {
        node.block.x = this.maxWidth;
        node.block.y = this.maxHeight;
      }

      // check if the block would fall outside
      if ( (node.block.x + pos.x) > app.width) {
        // if it would fall outside the svg,
        // go to the next line
        pos.x = 0;
        pos.y = pos.y + this.maxHeight + this.verticalGap;
      }

      // set the position for this block
      node.destination = {};
      node.destination.x = pos.x;
      node.destination.y = pos.y;

      // give it a starting position if it doesn't have one
      if (node.x === undefined) {
        node.x = 0;
        node.y = 0;
      }

      // update the position cursor
      pos.x = pos.x + node.block.x + this.horizontalGap + (this.horizontalPadding * 2);

    }
    console.log(this);
    this.totalHeight = pos.y + this.maxHeight + this.verticalGap;
  },

  move: function() {
    app.height = this.totalHeight;
    app.resizeSVG();
    d3.selectAll(".block").transition()
      .duration(1000)
      .attr("transform", function (d){
        return trans(d.destination.x,
          d.destination.y);
      });
  },

  restart: function() {
    this.calculatePositions();
    this.move();
  },

  setSize: function() {
    this.restart();
  },

  initSVG: function(){
    this.gs = app.svg.selectAll("g.block")
      .data(this.nodes)
      .enter().append("g")
      .attr("transform", function(d){ return trans(d.x, d.y); })
      .attr("class", "node block");
    //this.gs.append("rect")
      //.attr("width",  function(d){ return d.block.x; })
      //.attr("height", function(d){ return d.block.y; });
    var me = this;
    this.gs.append("svg:foreignObject")
      .attr("width",  function(d){ return d.block.x + (me.horizontalPadding * 2); })
      .attr("height", function(d){ return d.block.y + (me.verticalPadding * 2); })
      .append("xhtml:div").attr("class", "node-title")
      .style("width", function(d){ return d.block.x + "px"; })
      .style("height", function(d){ return d.block.y + "px"; })
      .text(function(d){ return d.displayText; });
  },

  start: function(){
    this.nodes = app.models.getAllNodesRandomly();
    this.calculatePositions();
    this.initSVG();
    this.move();
  },



};

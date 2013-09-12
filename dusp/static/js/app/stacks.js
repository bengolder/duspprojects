// name space!
var app = app || {};


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

    for (var i = this.order.length; i; i -= 1) {

      // do something can I measure characters?
      // over a certain amount, I can assume it should be max width;
      var index = this.order[i - 1]
      var node = app.models.nodes[index]
      var text = node.displayText;

      // set default height and width of block
      // make sure the width is in ems
      node.block = {
        x: app.grid.ems(Math.ceil(text.length / 1.6)),
        y: app.grid.vu,
      };


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

  restart: function() {
    this.calculatePositions();
    this.move();
  },

  setSize: function() {
    this.restart();
  },

  initSVG: function(){
    // make svg elements. Assume they don't exist
    app.gs = app.svg.selectAll("g.block")
      .data(this.nodes)
      .enter().append("g")
      .attr("transform", function(d){ return trans(d.x, d.y); })
      .attr("class", "node block");
    //this.gs.append("rect")
      //.attr("width",  function(d){ return d.block.x; })
      //.attr("height", function(d){ return d.block.y; });
    var me = this;
    app.gs.append("svg:foreignObject")
      .attr("width",  function(d){ return d.block.x + (me.horizontalPadding * 2); })
      .attr("height", function(d){ return d.block.y + (me.verticalPadding * 2); })
      .append("xhtml:div").attr("class", function(d){
        return d.nodeType + " node-title";
      })
      .style("width", function(d){ return d.block.x + "px"; })
      .style("height", function(d){ return d.block.y + "px"; })
      .text(function(d){ return d.displayText; });

    app.dots = app.gs.append("g").attr("class", "dots")
      .attr("transform", function(d){return "translate("+app.grid.em/2+",0)";});
    app.dots.append("circle").attr("class", "dot-outline")
      .attr("r", (app.grid.vu / 2) - 6);
    app.dots.append("circle").attr("class", "dot")
      .attr("r", (app.grid.em / 2) - 4 );
  },



  move: function() {
    app.height = this.totalHeight;
    app.resizeSVG();
    app.gs.transition()
      .duration(2000)
      .attr("transform", function(d){
        return trans(d.destination.x, d.destination.y);
      });
    app.linkLines.transition()
      .duration(2000)
      .attr("x1", function(d){
        return d.source.destination.x;
      })
      .attr("y1", function(d){
        return d.source.destination.y;
      })
      .attr("x2", function(d){
        return d.target.destination.x;
      })
      .attr("y2", function(d){
        return d.target.destination.y;
      });

    app.gs.select(".dots").transition()
      .duration(2000)
      .attr("transform", trans(app.grid.em/2, 0));
  },

  nodeHover: function(d, i){
    var g = d3.select(this)
    g.select(".dot")
      .style("opacity", 1);
    g.select(".node-data")
      .style("background", "rgba(0,0,0,0.8)");
	console.log("hovered", d);
  },

  nodeUnhover: function(d, i){
    var g = d3.select(this)
    g.select(".dot")
      .style("opacity", 0);
    g.select(".node-data")
      .style("background", "none");
  },

  updateSVG: function(){
    app.fadeInTitle(app.gs, "left");
    app.gs.on("mouseenter", this.nodeHover)
      .on("mouseleave", this.nodeUnhover)
      .on("click", this.nodeClick);
  },

  start: function(){
    this.nodes = app.models.getAllNodesRandomly();
    this.calculatePositions();
    this.initSVG();
    this.move();
  },

  takeover: function(){
    app.currentView = app.brickView;
    app.brickView.order = app.models.getShuffledNodeIndices();
    app.brickView.calculatePositions();
    app.brickView.move();
    app.brickView.updateSVG();
  },

  intro: function(){
  },


};

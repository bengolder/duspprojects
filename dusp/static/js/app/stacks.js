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

  restoreSelection: function(){
	  app.selection.forEach(function(d, i, arr){
		  d.el.each(function(d, i){
			  app.brickView.nodeClick.call(this, d, i);
		  });
	  });
	  app.selection = [];
  },

  buildBlockSize: function(node){
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

	  // reset the size of the foreign element
	  node.el.select(".foreign")
		  .attr("width", 
			  node.block.x + (app.grid.hPad * 2))
		  .attr("height",
			  node.block.y + (app.grid.vPad));
  },

  calculatePositions: function(){
    // for each object, pick a point on the grid
    // use a standard object height

    var pos = {x: 0, y: this.verticalGap};

    for (var i = this.order.length; i; i -= 1) {

      // do something can I measure characters?
      // over a certain amount, I can assume it should be max width;
      var index = this.order[i - 1]
      var node = app.models.nodes[index]

	  this.buildBlockSize(node);

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
      .attr("transform", function(d){return trans(app.grid.ems(2), 4);});
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
      }).each("end", function(d){
		  d.x = d.destination.x;
		  d.y = d.destination.y;
	  });
    app.linkLines.transition()
      .duration(2000)
      .attr("x1", function(d){
        return d.source.destination.x + app.grid.em;
      })
      .attr("y1", function(d){
        return d.source.destination.y + 4;
      })
      .attr("x2", function(d){
        return d.target.destination.x + app.grid.em;
      })
      .attr("y2", function(d){
        return d.target.destination.y + 4;
      });

    app.gs.select(".dots").transition()
      .duration(2000)
      .attr("transform", trans(app.grid.em, 4));
  },

  nodeHover: function(d, i){
      var g = d3.select(this)
      moveElemToFront(this);
      g.select(".dot")
        .style("opacity", 1);


	  var links = d.getLinks();
	  links.forEach(function(link){
	  	link.el.style("opacity", 1);
	  });
	  var neighbors = d.getNeighbors();
	  neighbors.forEach(function(n){
	  	n.el.select(".dot")
	  		.style("opacity", 1);
	  });
  },

  nodeUnhover: function(d, i){
    var g = d3.select(this)
	if (!d.hasSelectedNeighbor()){
		g.select(".dot")
		  .style("opacity", 0);
	}
	var links = d.getLinks();
	links.forEach(function(link){
		if (!(link.target.selected || link.source.selected)){
			link.el.style("opacity", 0);
	}});
	var neighbors = d.getNeighbors();
	neighbors.forEach(function(n){
		if (!n.hasSelectedNeighbor() && !n.selected){
			n.el.select(".dot")
				.style("opacity", 0);
	}});
  },

  nodeClick: function(d, i){
	  // this toggles selection by removing or activating event listeners
      var g = d3.select(this)
	  if (d.selected){
		  // deselect
		  d.selected = false;
		  g.select(".halo").remove();
		  g.select(".link-box").remove();
		  g.on("mouseenter", app.brickView.nodeHover)
		   .on("mouseleave", app.brickView.nodeUnhover);
		  app.brickView.nodeUnhover.call(this, d, i);
	  } else {
		  // select
		  d.selected = true;
		  moveElemToFront(this);
		  app.brickView.nodeHover.call(this, d, i);
		  g.select(".dots").insert("circle", ":first-child")
			  .attr("class", "halo")
			  .attr("r", 15)
			  .style("fill", app.colors.fade("#fff", 0.1));
		  if (d.getURL()) {
				log("found a link");
				log(d, d.getURL());
			  var linkBox = g.append("g")
				  .attr("class", "link-box")
				  .attr("transform", trans(
							  app.grid.ems(3),
							  0
							  ))
				  .append("a")
				  .attr("xlink:href", d.getURL())
				  .attr("target", "_blank");

			  linkBox.append("text")
				  .text("→")
				  .attr("y", 11)
				  .style("fill", app.colors.text)
				  .style("font-size", "30px");

			  linkBox.on("mouseenter", function(d,i){
				  d3.select(this).select("text")
					.style("fill", d.getColor());
			  }).on("mouseleave", function(d,i){
				  d3.select(this).select("text")
					.style("fill", app.colors.text);
			  }).on("click", function(){
				  d3.event.stopPropagation();
			  });
		  }


		  g.on("mouseenter", null)
		   .on("mouseleave", null);
	  }
  },

  updateSVG: function(){
    app.fadeInTitle(app.gs, "left");
	app.linkLines.style("display", null)
		.style("stroke-width", "1")
		.style("stroke-dasharray", "4,4");
    app.gs.on("mouseenter", this.nodeHover)
      .on("mouseleave", this.nodeUnhover)
      .on("click", this.nodeClick);
  },

  shiftBricks: function(){
      app.currentView = app.brickView;
	  this.shuffle();
  },

  collapse: function(newView){
	  if (newView == app.stackView){
		  app.stackView.shiftBricks();
	  } else {
		  // remove events
		  app.gs.on("click",  null)
			.on("mouseenter", null)
			.on("mouseleave", null);
		  app.saveSelection()
		  this.closeSelections();
		  // hide titles
		  app.fadeOutTitle(app.gs, newView.takeover, newView);
	  }
  },

  closeSelections: function(){
	  app.gs.each(function(d, i){
		if (d.selected){
			app.brickView.nodeClick.call(this, d, i);
		}
		  
	  });
	  
	  console.log("this should be closing selections right now");
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
	setTimeout(app.brickView.restoreSelection, 3000);
  },

  shuffle: function(){
    app.brickView.order = app.models.getShuffledNodeIndices();
    app.brickView.calculatePositions();
    app.brickView.move();
  },
};

app.stackView = {

	sortNodes: function(){
		var textSort = function (a, b){
			if(a.displayText < b.displayText) return -1;
			if(a.displayText > b.displayText) return 1;
			return 0;
		};
		app.gs.sort(textSort);
	},

	calculatePositions: function(){
		this.sortNodes();
		var cols = {
			"person": {
				x: app.grid.ems(25),
				y: app.brickView.verticalGap,
			},
			"topic": {
				x: 0,
				y: app.brickView.verticalGap,
			},
			"project": {
				x: app.grid.ems(49),
				y: app.brickView.verticalGap,
			},
		};
		app.gs.each(function(d,i){
			app.brickView.buildBlockSize(d);
			d.destination = {};
			// get the column x and y
			d.destination.x = cols[d.nodeType].x;
			d.destination.y = cols[d.nodeType].y;
			// increment the column y
			cols[d.nodeType].y += (d.block.y + app.brickView.verticalGap);
		});
		this.totalHeight = d3.max([cols["person"],cols["topic"], cols["project"]], function(c){
			return c.y;
		});
	},

	move: function(){
		app.height = this.totalHeight;
		app.resizeSVG();
		app.gs.transition()
		  .duration(2000)
		  .attr("transform", function(d){
			return trans(d.destination.x, d.destination.y);
		  }).each("end", function(d){
			  d.x = d.destination.x;
			  d.y = d.destination.y;
		  });
		app.linkLines.transition()
		  .duration(2000)
		  .attr("x1", function(d){
			return d.source.destination.x + app.grid.em;
		  })
		  .attr("y1", function(d){
			return d.source.destination.y + 4;
		  })
		  .attr("x2", function(d){
			return d.target.destination.x + app.grid.em;
		  })
		  .attr("y2", function(d){
			return d.target.destination.y + 4;
		  });

		app.gs.select(".dots").transition()
		  .duration(2000)
		  .attr("transform", trans(app.grid.em, 4));
	},

	updateSVG: function(){
		app.brickView.updateSVG();
	},

	setSize: function(){
		app.height = this.totalHeight;
		app.resizeSVG();
	},

	shiftBricks: function(){
		app.currentView = app.stackView;
		app.stackView.calculatePositions();
		app.stackView.move();
	},

	takeover: function(){
		app.currentView = app.stackView;
		app.stackView.calculatePositions();
		app.stackView.move();
		app.stackView.updateSVG();
		setTimeout(app.brickView.restoreSelection, 3000);
	},

	collapse: function(newView){
	  if (newView == app.brickView){
		  app.brickView.shiftBricks();
	  } else {
		  app.gs.on("click",  null)
			.on("mouseenter", null)
			.on("mouseleave", null);
		  app.brickView.closeSelections();
		  app.fadeOutTitle(app.gs, newView.takeover, newView);
	  }
	},
};


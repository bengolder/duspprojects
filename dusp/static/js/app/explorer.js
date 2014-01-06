// I know how to do the force layout
// It has specific requirements
// The question now is how to architect the thing so that it intelligently
// switches between layout types

// name space!
var app = app || {};

app.currentView = null;
app.models.init();


app.header = $(".header");
app.svg = d3.select("#chart").append("svg");

app.selection = [];

app.saveSelection = function(){
	app.gs.each(function(d, i){
		if (d.selected) {
			app.selection.push(d);
		}
	});

};

app.fadeInTitle = function(s, align){
  app.showTitle(s, align);
  var wraps = s.selectAll(".foreignWrapper")
    .style("opacity", 0);
  wraps.transition()
    .delay(2000)
    .duration(1000)
    .style("opacity", 1);

  s.select(".dot").transition()
    .duration(2000)
    .style("opacity", 0);

  s.select(".dot-outline")
    .style("stroke-width", "1px")
    .style("fill", "rgba(0,0,0,0)");

};

app.fadeOutTitle = function(s, callback, thisArg){
	if (!callback){
		callback = function(){return;};
	}
	s.select(".foreignWrapper")
		.transition()
		.duration(1000)
		.style("opacity", 0)
		.select(function(d, i){
			if (i == 0){
				return this;
			}
		}).each("end", (function(){
			return function(d, i){
				app.hideTitle(s);
				callback.call(thisArg);
			};
		}()));
};

app.showTitle = function(s, align){
  var x, y, block;
  s.each(function(d){
	  app.brickView.buildBlockSize(d);
	  block = d.block;
  });
  if (align == "center"){
    x = block.x * -0.5;
    y = app.grid.vu * 0.75;
  } else if (align == "left"){
    x = app.grid.em * -0.5;
    y = app.grid.vPad;
  }
  s.select(".foreignWrapper").style("opacity", 1);


  s.select(".foreign")
    .attr("width", function(d){
		return d.block.x + (app.grid.hPad * 2);
	})
    .attr("height", function(d){
		return d.block.y + (app.grid.vPad);
	})
    .attr("x", x)
    .attr("y", y)
    .select(".node-data")
    .style("text-align", align)
    .select(".node-title")
    .style("background", null)
    .style("display", "inline-block")
    .style("text-align", align);
};

app.hideTitle = function(s){
  s.select(".foreign")
    .attr("width", 0)
    .attr("height", 0);
};

app.cleanSVG = function(){

  app.linksOut = app.svg.selectAll(".link")
    .data(app.models.links, function(d){
      return d.source.uniqueId() + d.target.uniqueId();
    }).exit();

  app.gsOut = app.svg.selectAll(".node")
    .data(app.models.nodes, function(d){ return d.uniqueId(); })
    .exit();

};

app.initSVG = function(){

  // make links
  app.linkLines = app.svg.selectAll(".link")
    .data(app.models.links, function(d){
      return d.source.uniqueId() + d.target.uniqueId();
    }).enter().append("line")
    .attr("class", function(d){
      return "link to"+d.target.nodeType + " " + d.source.uniqueId() + " " + d.target.uniqueId();
    });

  // make svg elements. turn them off right away
  // don't set things like height and width
  app.gs = app.svg.selectAll(".node")
    .data(app.models.nodes, function(d){ return d.uniqueId(); })
    .enter().append("g")
    .attr("class", function(d){ return d.nodeType + " node";});

  // link the data back to the svg
  app.linkLines.each(function(d){
	  d.el = d3.select(this);
  });

  app.gs.each(function(d){
	  d.el = d3.select(this);
  });


  // HACKY UGLY
  app.foreignWrappers = app.gs.append("g")
    .attr("class", "foreignWrapper");

  app.foreigns = app.foreignWrappers.append("svg:foreignObject")
    .attr("class", "foreign");

  // bam! we got html all up in this sveegy!
  app.dataDivs = app.foreigns.append("xhtml:div")
                  .attr("class", function(d){
                    return "node-data " + d.nodeType;});

  app.titles = app.dataDivs.append("div")
    .attr("class", "node-title")
    .text(function(d){ return d.displayText; });

  // gimme dots. Dots all over the place. Dots inside dots
  app.dots = app.gs.append("g").attr("class", "dots")
    .attr("transform", function(d){return "translate("+app.grid.em/2+",0)";});
  app.dots.append("circle").attr("class", "dot-outline")
    .attr("r", (app.grid.vu / 2) - 6);
  app.dots.append("circle").attr("class", "dot")
    .attr("r", (app.grid.em / 2) - 4 );
};

app.resizeSVG = function(){
  app.svg.attr("height", app.height)
         .attr("width", app.width);
};

app.setSize = function(){
  var w = w || $(window).width();
  w = w - (app.grid.ems(4));
  var h = $(window).height() - app.header.height();
  h = h - app.grid.vus(2);
  app.width = w;
  app.height = h;
  app.resizeSVG();
  if (app.currentView != null) {
    // send a signal to the current view
    app.currentView.setSize();
  }

};

app.handleControlClick = function(d, i){
  // switch the class on the view icon so it's
  // obvious which one is activated
  $(".control").removeClass("current_view");
  var $el = $(this);
  $el.addClass("current_view");
  // now select the new view based on the class of the clicked icon
  var classes = ["network",     "brick",       "globe",       "stack"  ];
  var views   = [app.forceView, app.brickView, app.globeView, app.stackView];
  var newViewName;
  var newView;
  classes.forEach(function(name, i){
    if ($el.hasClass(name)){
      newViewName = classes[i];
      newView = views[i];
    }
  }, this);
  if (app.currentView === newView){
    if (app.currentView == app.brickView){
        app.brickView.shuffle();
    }
    // if someone's just clicking on the current view, ignore it.
    return;
  }
  // do the switch
  app.currentView.collapse(newView);
};

app.setSize();
window.onresize = app.setSize;

app.onLoad = function(){
  app.models.buildGraph();
  app.initSVG();
  d3.selectAll(".control").on("click", app.handleControlClick);
  // do the first thing
  app.forceView.intro();
  app.currentView = app.forceView;
};









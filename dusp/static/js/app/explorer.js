// I know how to do the force layout
// It has specific requirements
// The question now is how to architect the thing so that it intelligently
// switches between layout types

// name space!
var app = app || {};

app.currentView = null;
app.models.init();


app.colors = {
    text: "#888",
    projectsBase: "#FF4010",
    topicsBase: "#0785FF",
    peopleBase: "#0785FF",
};

app.grid = {
  vu: 22,
  em: 14,
  ems: function(n){ return this.em * n; },
  vus: function(n){ return this.vu * n; },
  wMax: app.grid.ems(18),
  hMax: app.grid.vus(2),
  hGap: app.grid.em,
  vGap: app.grid.vu,
  hPad: app.grid.em / 2,
  vPad: app.grid.vu / 4,
};

app.header = $(".header");
app.svg = d3.select("#chart").append("svg");

app.showTitle = function(s){
  // this needs to reduce the div to the correct display size
  s.select(".foreign")
    .attr("width", app.grid.wMax)
    .attr("height", (app.grid.vu * 2) + (app.grid.vPad))
    .attr("x", app.grid.wMax * -0.5)
    .attr("y", app.grid.vu)
    .select(".node-data")
    .style("text-align", "center")
    .select(".node-title")
    .style("display", "inline-block")
    .style("text-align", "center");
};

app.hideTitle = function(s){
  s.select(".foreign")
    .attr("width", 0)
    .attr("height", 0);
};

app.initSVG = function(){

  // make links
  app.linkLines = app.svg.selectAll(".link")
    .data(app.models.links)
    .enter().append("line")
    .attr("class", "link");
    // .style("display", "none");

  // make svg elements. turn them off right away
  // don't set things like height and width
  app.gs = app.svg.selectAll(".node")
    .data(app.models.nodes)
    .enter().append("g")
    .attr("class", function(d){ return d.nodeType + " node";});
    //.style("display", "none");


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

  // we'll save the picture and markdown rendering for later
  app.details = app.dataDivs.append("div")
    .attr("class", "node-details");

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
  $(".control").removeClass("current_view");
  var $el = $(this);
  $el.addClass("current_view");
  var views   = [app.forceView, app.brickView, app.globeView, app.stackView];
  var classes = ["networkize",  "randomize",   "locate",      "organize"  ];
  var newView;
  classes.forEach(function(name, i){
    if ($el.hasClass(name)){
      newView = views[i];
    }
  }, this);
};

app.setSize();
window.onresize = app.setSize;

app.onLoad = function(){
  app.models.buildGraph();
  app.initSVG();
  d3.selectAll(".control").on("click", app.handleControlClick);
  app.forceView.intro();
  app.currentView = app.forceView;
};









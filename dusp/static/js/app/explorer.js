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

app.header = $(".header");
app.svg = d3.select("#chart").append("svg");

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

app.setSize();
window.onresize = app.setSize;

app.onLoad = function(){
  app.brickView.start();
  app.currentView = app.brickView;
};


/*
    What data do I have:
      Topics
      People
      Projects
      Countries
      
For the network visualiztion, and the stacking visualizations,
  I can ignore the Countries
  For the countries, I don't know, I'll do something else
  But this means that I need a d3-friendly graph for the network viz
  But once this graph is constructed, I should hold onto it.

  I shouldn't recreate it each time.

  But I need a special construction animation

  But I also want to animate the construction of this graph.

*/




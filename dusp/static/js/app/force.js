// Constants for all should include svg, and node and link svg selections

// name space!
var app = app || {};

app.grid = {
  vu: 22,
  em: 14,
  ems: function(n){ return this.em * n; },
  vus: function(n){ return this.vu * n; },
};

$.extend(app.grid, {
  wMax: app.grid.ems(18),
  hMax: app.grid.vus(2),
  hGap: app.grid.em,
  vGap: app.grid.vu,
  hPad: app.grid.em / 2,
  vPad: app.grid.vu / 4,
});


var moveElemToFront = function(elem){
  elem.parentNode.appendChild(elem);
};

var moveSelToFront = function(s){
  return s.each(function(){
    moveElemToFront(this);
  });
};

var moveToIndex = function(elem, i){
  var p = elem.pNode;
  p.insertBefore(elem, p.childNodes[i]);
};

app.forceView = {

    initForce: function(){
        // how should I handle the initiation of the force?
        this.force = d3.layout.force()
            .size([app.width, app.height])
            .linkDistance(60)
            .charge(-120)
            .on("tick", this.tick);
    },

    stop: function(){
      // stop, collaborate, and listen!
      this.force.stop();
    },

    tick: function() {
      // redo links
      app.linkLines.attr("x1", function(d){ return d.source.x; })
        .attr("y1", function(d){ return d.source.y; })
        .attr("x2", function(d){ return d.target.x; })
        .attr("y2", function(d){ return d.target.y; });
      // filter down to the nodes with force
      app.gs.attr("transform", function(d){
        return "translate(" + d.x + "," + d.y + ")";
      });

    },
  
    restart: function() {
        this.force.start();
    },

    setSize: function(){
      this.force.size([app.width, app.height]);
      this.restart();
    },

    takeover: function(){
      // this method takes the existing view and transitions it to the force
      // view
      // any necessary event listeners should be removed
      // any open pieces should be closed
      // everything should be collapsed to it's node
      // The links should fade in
      // then the forces should begin acting on all the nodes
      // and any event listeners should be added.
    },

    nodeClick: function(d, i){
      // put it in front
      moveElemToFront(this);
      // then expand all the details
    },

    nodeHover: function(d, i){
      // put it in front
      moveElemToFront(this);
      // highlight it
      var sel = d3.select(this);
      // show the title
      app.showTitle(sel);
      sel.select(".dot-outline").transition()
        .duration(100)
        .attr("r", app.grid.em);
    },
    nodeUnhover: function(d, i){
      var sel = d3.select(this);
      app.hideTitle(sel);
      sel.select(".dot-outline").transition()
        .duration(300)
        .attr("r", 2);
    },

    updateSVG: function( ){

      app.linkLines
        .on("click", function(d){
          console.log(d); });

      // setup events
      // make it draggable
      var rPerson = 8;
      var rProject = 7;
      var adjust = -1;

      app.gs
        .call(this.force.drag)
        .on("click", this.nodeClick)
        .on("mouseenter", this.nodeHover)
        .on("mouseleave", this.nodeUnhover)
        .select(".dots")
        .attr("transform", "translate("+ adjust +","+ adjust +")")
        .select(".dot")
        .attr("r", function(d){
          if (d.nodeType == "person"){
            return rPerson;
          } else {
            return rProject;
          }
        });
    },

    updateTopics: function(){
      // get the nodes that DON'T have the topics
      var selected = app.models.topics.filter( function(d){
        return d.selected;
      });
      if (selected.length > 0){
        app.gs.select(".dots").transition()
          .duration(500)
          .style("opacity", function(d){
            if (d.hasSelectedTopics()){
              return 1.0;
            } else {
              return 0.1;
          }});

        app.linkLines.transition()
          .duration(500)
          .style("opacity", function(d){
            if (d.target.hasSelectedTopics() && d.source.hasSelectedTopics()){
              return 1.0;
            } else {
              return 0.1;
          }});
      } else {
        app.gs.select(".dots").transition()
          .duration(500)
          .style("opacity", 1.0);
        app.linkLines.transition()
          .duration(500)
          .style("opacity", 1.0);
      }

    },

    handleTopicClick: function(d){
      if (d.selected) {
        d.selected = false;
        $(this).removeClass("selected");
      } else {
        d.selected = true;
        $(this).addClass("selected");
      }
      app.forceView.updateTopics();
    },

    layoutTopics: function(){
      d3.select("#chart").append("div")
        .attr("class", "topicMenu")
        .selectAll(".topic")
        .data(app.models.topics)
        .enter().append("div")
        .attr("class", "topic")
        .text(function(d){
          return d.displayText;
        }).on("click", this.handleTopicClick);
    },

    intro: function(){
      // this goes through an animation of data loading
      // get indices
      this.initForce();
      this.force.nodes( app.models.nodes );
      // setup links
      this.force.links( app.models.links );
      this.updateSVG();
      this.restart();
      this.layoutTopics();
      console.log(app.models.nodes);
    },


};

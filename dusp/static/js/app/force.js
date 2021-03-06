// Constants for all should include svg, and node and link svg selections

// name space!
var app = app || {};

var log = function(thing){
	console.log(thing);
};


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

    collapse: function(newView){

      // this preps the nodes to be switched to another view
      this.stop();

	  app.saveSelection();

	  app.gs.each(function(d){
		  d.fixed = true;
		  if (d.selected) {
			  app.forceView.nodeClick.call(this, d);
			  d.selected = false;
		  }
	  });

      app.models.topics.forEach(function(t){
        t.selected = false;
      });

      this.updateTopics();

      app.gs.on("click",  null)
        .on("mouseenter", null)
        .on("mouseleave", null)
        .on("mousedown.drag", null);

	  var numTopics = app.models.topics.length;
      d3.selectAll("div.topicToggle")
        .transition()
        .duration(900)
        .style("margin-left", app.grid.ems(2) + "px")
        .style("margin-bottom", app.grid.vu + "px")
        .style("opacity", 0)
        .each("end", function(d, i){
          d3.select(this).remove();
		  if (i == numTopics - 1){
			  // if we are on the last topic, remove the whole menu
			  d3.select(".topicMenuWrapper").remove();
		  }
        });

      // hide all dot outlines
      d3.selectAll(".dot-outline").transition()
        .duration(300)
        .attr("r", 6)
		.style("stroke", function(d){
			return d.getColor();
		});

      // hide all titles and extra info
      d3.selectAll(".foreign")
        .attr("width", 0)
        .attr("height", 0)
        .attr("x", 0)
        .attr("y", 0);

	  // make link lines transparent
      app.linkLines.transition()
        .duration(900)
        .style("opacity", 0.0)
      
	  // make dots small
      d3.selectAll("circle.dot").transition()
        .duration(1000)
        .attr("r", 4);

      var topicNodes = d3.selectAll(".node.topic")
        .style("opacity", 0)
        .style("display", null);

	  // animate the appearnce of topic nodes
      var one = topicNodes.transition()
        .duration(1100)
        .style("opacity", 1)
        .attr("transform", function(d, i){
          d.y = (i * app.grid.vus(2)) + app.grid.vu;
          return "translate("+d.x+","+d.y+")";
        }).select(function(d,i){
          if (i ==0){ return this; }
        }).each("end", newView.takeover);

    },

	restoreSelection: function(){
		app.selection.forEach(function(d, i, arr){
			if (d.nodeType !== "topic"){
				d.el.each(function(d, i){
					app.forceView.nodeClick.call(this, d, i);
				});
			}
		});
		app.selection = [];
	},

    takeover: function(){
		console.log("forceView taking over");
		this.updateSVG();
		this.restart();
		this.layoutTopics();
        app.currentView = this;
		app.gs.each(function(d){
			d.fixed=false;});
		setTimeout(this.restoreSelection, 1500);
    },

    nodeClick: function(d, i){
	    var target = d3.select(this);
	    if (d.selected) {
	        d.selected = false;
		    target.select(".link-box").remove();
	        target.on("mouseenter", app.forceView.nodeHover)
				  .on("mouseleave", app.forceView.nodeUnhover);
			app.forceView.nodeUnhover.call(this, d, i);
	    } else {
	        d.selected = true;
	        moveElemToFront(this);
			app.forceView.nodeHover.call(this, d, i);

		    if (d.getURL()) {
				log("found a link");
				log(d, d.getURL());
		        var linkBox = target.append("g")
		      	  .attr("class", "link-box")
		      	  .attr("transform", trans(
		      				  app.grid.ems(3),
		      				  app.grid.vu - 4
		      				  ))
		      	  .append("a")
		      	  .attr("xlink:href", d.getURL())
		      	  .attr("target", "_blank");

			    linkBox.append("title")
				    .text("home page for "+d.displayText);

				linkBox.append("rect")
					.attr("x", -14)
					.attr("y", -16)
					.attr("width", app.grid.ems(4))
					.attr("height", app.grid.vu)
					.style("fill", app.colors.fade("#222", 0.7));

		        linkBox.append("text")
		      	  .text("→")
		      	  .attr("y", 3)
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
	        // remove listeners
	        target.on("mouseenter", null)
				  .on("mouseleave", null);
	    }
    },


    nodeHover: function(d, i){
      // put it in front
      moveElemToFront(this);
      // highlight it
      var sel = d3.select(this);
      // show the title
      app.showTitle(sel, "center");

      sel.select(".dot-outline").transition()
        .duration(100)
        .attr("r", app.grid.em);

	  sel.select(".node-title")
		  .style("background-color", 
			  app.colors.fade("#222", 0.7));

	  d.getLinks().forEach(function(link){
		  link.el.style("opacity", 1.0)
	  });

	  d.getNeighbors().forEach(function(n){
		  if (!n.selected){
			  n.el.select(".dot-outline")
				.attr("r", app.grid.em - 3);
		  }
	  });


    },

    nodeUnhover: function(d, i){
      var sel = d3.select(this);
      app.hideTitle(sel);
	  sel.select(".node-title")
		  .style("background-color", null);

	  if (!d.hasSelectedNeighbor()){
		  sel.select(".dot-outline").transition()
			.duration(300)
			.attr("r", 5);
	  } else {
		  sel.select(".dot-outline").transition()
			.duration(100)
			.attr("r", app.grid.em - 3);
	  }

	  d.getLinks().forEach(function(link){
		  if (!(link.target.selected || link.source.selected)){
			  link.el.style("opacity", 0.5)
	  }});

	  d.getNeighbors().forEach(function(n){
		  if (!n.hasSelectedNeighbor() && !n.selected){
			  n.el.select(".dot-outline").transition()
				.duration(100)
				.attr("r", 5);
	  }});
    },

    updateSVG: function( ){

      app.linkLines
		.style("stroke-width", null)
		.style("stroke-dasharray", null)
		.transition()
		.duration(500)
		.style("opacity", 0.5);

	  app.dots.select(".dot").transition()
		  .duration(500)
		  .style("opacity", 1);
	  app.dots.select(".dot-outline")
		  .style("fill", "rgba(38, 38, 38, 0.8)")
		  .style("stroke", "none");

      d3.selectAll(".totopic").style("display", "none");
      d3.selectAll(".node.topic").style("display", "none");

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
          if (d.nodeType == "project"){
            return rProject;
          } else {
            return rPerson;
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

		app.models.sortTopics();

      // layout the invisible nodes
      d3.selectAll(".node.topic")
        .attr("transform", function(d, i){
          d.x = app.grid.em;
          d.y = (i * app.grid.vu) + app.grid.vu;
          return "translate("+d.x+","+d.y+")";
        });

      var menu = d3.select("#chart").append("div")
		  .attr("class", "topicMenuWrapper").append("div")
        .attr("class", "topicMenu");

	  // add the nice thin scrollbar
	  $(".topicMenu").slimScroll({
		  height: app.grid.vus(15),
	  });

      menu.selectAll(".topicToggle")
        .data(app.models.topics)
        .enter().append("div")
        .attr("class", "topicToggle")
        .text(function(d){
          return d.displayText;
        }).on("click", this.handleTopicClick);

    },

    intro: function(){
      // this goes through an animation of data loading
      // get indices
      this.initForce();
      this.force.nodes( app.models.nonTopicNodes() );
      // setup links
      this.force.links( app.models.nonTopicLinks() );
      this.updateSVG();
      this.restart();
      this.layoutTopics();
    },

};



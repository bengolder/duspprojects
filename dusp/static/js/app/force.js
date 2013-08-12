// Constants for all should include svg, and node and link svg selections

// name space!
var app = app || {};

app.forceView = {

    initForce: function(){
        // how should I handle the initiation of the force?
        this.force = d3.layout.force()
            .size([app.width, app.height])
            .linkDistance(60)
            .charge(-120)
            .on("tick", this.tick);

        this.nodes = this.force.nodes() || [];
        this.links = this.force.links() || [];
    },

    stop: function(){
      // stop, collaborate, and listen!
      this.force.stop();
    },

    addNode: function(n){
      // add this node to the nodes
      this.nodes.push(n);

      var targets = app.models.getAllConnecting(n);
      for (var i = 0; i < targets.length; i++){
        var target = targets[i];
        // is it already a node?
        var idx = this.nodes.indexOf(target);
        if (idx < 0) {
          // if not, then add it
          this.nodes.push(target);
        }

        // add a link
        this.links.push({
          source: n,
          target: target,
        });
      }

      this.restart();

    },

    initSVG: function() {
      this.linkSel = app.svg.selectAll(".link");
      this.nodeSel = app.svg.selectAll(".node");
    },

    tick: function() {

        // the linkSelection
        app.forceView.linkSel.attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; });

        // the nodeSelection
        app.forceView.nodeSel.attr("cx", function(d) { return d.x; })
                    .attr("cy", function(d) { return d.y; });

    },
  
    restart: function() {
        // refresh our selections with data
        this.linkSel = this.linkSel.data(this.links);

        // draw new svg elements based on enter selection
        this.linkSel.enter().insert("line", ".node")
            .attr("class", "link");


        // update node selection with data
        this.nodeSel = this.nodeSel.data(this.nodes);

        // draw new svg elements based on enter selection
        this.nodeSel.enter().insert("circle", ".cursor")
            .attr("class", "node")
            .attr("r", 5)
            .on("mousedown", function(d){ console.log(d); })
            .call(this.force.drag);

        // restart the force
        this.force.start();
    },

    setSize: function(){
      this.force.size([app.width, app.height]);
      this.restart();
    },

    start: function(){
      this.initForce();
      this.initSVG();
      app.models.people.forEach(this.addNode, this);
      app.models.projects.forEach(this.addNode, this);
    }
};

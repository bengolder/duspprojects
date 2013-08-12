// what is a constant?
// what is redrawn?
// CONSTANTS:
//      svg
//      graph nodes & links
//      node and link svg selections
//      force object
//  REDRAW:
//      when nodes and links are edited:
//      we update the svg selections
//      and restart the force
//      This is distinct from the animation tick, which happens all the time
//  TICK:
//      use the force objects to reposition the svg.


var width = 960,
    height = 500;

// initialize a force object with one node
var force = d3.layout.force()
    .size([width, height])
    .nodes([{}]) // initialize with a single node
    .linkDistance(30)
    .charge(-60)
    .on("tick", tick);

// make an svg container
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .on("mousemove", mousemove)
    .on("mousedown", mousedown);

// make a rectangle?? for no reason?
svg.append("rect")
    .attr("width", width)
    .attr("height", height);

// grab some variables for the force objects and for the svg selections
var nodes = force.nodes(),
    links = force.links(),
    node = svg.selectAll(".node"),
    link = svg.selectAll(".link");

// make a cursor
var cursor = svg.append("circle")
    .attr("r", 30)
    .attr("transform", "translate(-100,-100)")
    .attr("class", "cursor");

// run everything, this is basically a redraw function
restart();

// move the cursor when the mouse moves
function mousemove() {
  cursor.attr("transform", "translate(" + d3.mouse(this) + ")");
}

// when the mouse button is pushed, add nodes and links as appropriate,
// based on distance, then redraw
function mousedown() {

  // first make the node
  var point = d3.mouse(this),
      node = {x: point[0], y: point[1]},
      n = nodes.push(node);

  // add links to any nearby nodes
  nodes.forEach(function(target) {
    var x = target.x - node.x,
        y = target.y - node.y;

    if (Math.sqrt(x * x + y * y) < 30) {
      links.push({source: node, target: target});
    }

  });

  // redraw
  restart();

}

// use the forces to reposition the svg elements
function tick() {
  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
}

function restart() {
  // redraw svg elements based on changes to graph structure

  // here we refresh the svg selection based on any updates to the links
  link = link.data(links);

  // now we add new lines for each links these are entered
  // _before_ all the node objects (so that we have appropriate layers
  link.enter().insert("line", ".node")
      .attr("class", "link");

  // the node selection is refreshed with new nodes
  node = node.data(nodes);

  // circles are added for any new nodes, before the cursor
  node.enter().insert("circle", ".cursor")
      .attr("class", "node")
      .attr("r", 5)
      .call(force.drag); // dragging is enabled for the circles

  // the force calcs are restarted with the new objects
  force.start();
}

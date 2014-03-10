define(
['jquery','colors'],

function($, colors){

var Node = function Node(obj){
    if (obj.full_name !== undefined){
		obj.nodeType = "person";
		obj.displayText = obj.full_name;
    } else if (obj.partners !== undefined) {
		obj.nodeType = "project";
		obj.displayText = obj.title;
    } else if (obj.collection !== undefined) {
		obj.nodeType = "topic";
		obj.displayText = obj.title;
    } else {
		console.log("I don't know what this is", obj);
    }
    // we will want these so that we can move links with 
    // the nodes they are attached to
    obj.incomingLinks = [];
    obj.outgoingLinks = [];
	obj.eventListeners = {};
    obj.selected = false;
    obj.subselected = false;
    $.extend(this, obj);
    return this;
};



Node.prototype = {

 on: function( eventName, callback ){
	  if (this.eventListeners[eventName] == undefined){
		  this.eventListeners[eventName] = [];
	  }
	  this.eventListeners[eventName].push(callback);
  },

  fire: function( eventName, data ){
	  var listeners = this.eventListeners[eventName];
	  var target = this;
	  if (listeners) {
		  listeners.forEach( function(callback, i ){
			  callback( target, data );
		  });
	  }
  },

  getURL: function(){
	  if (this.nodeType == "project") {
		  return this.website;
	  } else if (this.nodeType == "person") {
		  return this.home_page;
	  } else {
		  return null;
	  }
  },

  getDisplayText: function(){
    return this.displayText;
  },

  numLinks: function(){
	  return this.outgoingLinks.length + this.incomingLinks.length;
  },

  uniqueId: function(){
    return this.nodeType + this.id;
  },

  hasSelectedTopics: function(){
    var theseTopics;
    if (this.nodeType == "person"){
      theseTopics = this.interests;
    } else if (this.nodeType == "project"){
      theseTopics = this.topics;
    } else {
      theseTopics = [];
    }
    for (var i = theseTopics.length; i > 0; i = i-1){
      var topic = theseTopics[i-1];
      if (topic.selected) {
        return true;
      }
    }
    return false;
  },

  getColor: function(){
	  if (this.nodeType == "person"){
		  return colors.peopleBase;
	  } else if (this.nodeType == "topic") {
		  return colors.topicsBase;
	  } else {
		  return colors.projectsBase;
	  }
  },

  getLinks: function(){
	  return this.incomingLinks.concat(this.outgoingLinks);
  },

  getNeighbors: function(){
	  var neighbors = [];
	  this.incomingLinks.forEach(function(link){
		  neighbors.push(link.source);
	  });
	  this.outgoingLinks.forEach(function(link){
		  neighbors.push(link.target);
	  });
	  return neighbors;
  },

  hasSelectedNeighbor: function(){
	  var outs = this.outgoingLinks.length;
	  var ins = this.incomingLinks.length;
	  for (var i = 0; i < outs; i++ ){
		  if (this.outgoingLinks[i].target.selected){
			  return true;
		  }
	  }
	  for (var i = 0; i < ins; i++ ){
		  if (this.incomingLinks[i].source.selected){
			  return true;
		  }
	  }
	  return false;
  },

  renderDetails: function(){
	  if (this.nodeType == "person"){
		  this.el.select(".node-details")
			  .text(this.bio);
	  } else if (this.nodeType == "project"){
		  this.el.select(".node-details")
			  .text(this.description);
	  } else if (this.nodeType == "topic"){
		  this.el.select(".node-details")
			  .text(this.description);
	  }
  },


}


return Node;
});

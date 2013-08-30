// name space!
var app = app || {};

app.colors = {
    text: "#888",
    projectsBase: "#999999",
    peopleBase: "#FF4010",
    topicsBase: "#0785FF",
};

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

function shuffle(arr){ //v1.0
  // this function steps backwards through an array, as it does so, it swaps
  // the current value with a randomly selected one that it hasn't yet touched.
  for (var r, x, i = arr.length; // initialization
        i;  // condition (will be true until end)
        j = parseInt( Math.random() * i),  // get random index
        i = i - 1,  // decrement
        x = arr[i], // store the current value
        arr[i] = arr[j], // set the current spot equal to the random value
        arr[j] = x // put the cuurent value into the random place
      );
    return arr;
}


function trans(x, y) {
  return "translate("+x+","+y+")";
}

app.Node = function(obj){
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
    obj.selected = false;
    $.extend(this, obj);
    return this;
};

app.Node.prototype = {

  getDisplayText: function(){
    return this.displayText;
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
        console.log("found a selected topic!", topic, this);
        return true;
      }
    }
    return false;
  },

  getColor: function(){
	  if (this.nodeType == "person"){
		  return app.colors.peopleBase;
	  } else if (this.nodeType == "topic") {
		  return app.colors.topicsBase;
	  } else {
		  return app.colors.projectsBase;
	  }
  },
};

// we will make a singleton to hold all the data
app.models = {

    modelNames: ['countries', 'topics', 'people', 'projects'],
    ajaxes: 0,
    nodes: [],
    links: [],

    init: function(){
        this.jq = $(this);
        this.ajaxGetData();
    },

    // event jQuery wrappers
    on: function(eventType, callback){
        this.jq.on(eventType, callback);
    },
    trigger: function(eventType, data){
        this.jq.trigger(eventType, data);
    },
    listenTo: function(other, eventType, callback){
        other.on(eventType, callback);
    },

    // get a single item
    getItem: function(model, id){
        for (var i = this[model].length; i; i = i - 1){
            var m = this[model][i - 1];
            if (m.id == id){
                return m;
            }
        }
    },

    filterNodes: function(filterFunc){
      return this.nodes.filter(filterFunc);
    },

    filterLinks: function(filterFunc){
      return this.links.filter(filterFunc);
    },

    nonTopicNodes: function(){
      return this.filterNodes(function(n){
        return (n.nodeType !== "topic");
      });
    },

    nonTopicLinks: function(){
      return this.filterLinks(function(link){
        return (link.source.nodeType !== "topic" &&
          link.target.nodeType !== "topic");
      });
    },

    getAllConnecting: function(item, neighborProps){
      var prop1 = neighborProps.shift();
      if (neighborProps.length > 0){
        return item[prop1].concat.apply(item[prop1], 
          neighborProps.map(function(p){ return item[p];})
            );
      } else {
        return item[prop1];
      }
    },

    getAllNodes: function(){
      return this.people.concat(this.projects, this.topics);
    },

    getAllNodesRandomly: function(){
      return shuffle(this.getAllNodes());
    },

    getShuffledNodeIndices: function(){
      var len = this.nodes.length;
      var indices = [];
      for (var i = 0; i < len; i++){
        indices.push(i);
      }
      return shuffle(indices);
    },

    makeLinks: function( modelToEdit, propertyName, modelForLookup){
        // this goes through all the models 
        // this will replace a list of ids with links to the actual objects
        var me = this;

        this[modelToEdit].forEach(function(item, index){
            // first, put it in the nodes
            // and store its id
            var ids = item[propertyName];
            if (ids.length > 0){ // make sure it exists
                var models = [];
                ids.forEach(function (id, i, arr){
                    // for each id, try to get a model
                    var model = me.getItem(modelForLookup, id);
                    if (model){ // if the model is found
                        models.push(model);
                    } else {
                        console.log(modelForLookup, id, "not found");
                    }
                });
                item[propertyName] = models;
            }
        });

        console.log("linked", modelToEdit,"with", modelForLookup);
    },

    addNode: function(n, connectingProperties){
      // first, add the node to nodes
      this.nodes.push(n);

      // get all it's targets.
      var targets = app.models.getAllConnecting(n, connectingProperties);
      for (var i = 0; i < targets.length; i++){
        var target = targets[i];
        // is it already a node?
        var idx = this.nodes.indexOf(target);
        if (idx < 0) {
          // if not, then add it
          this.nodes.push(target);
        }

        // add a link
        var link = {source: n, target: target,};
        // now our nodes can access the link, and know
        // which end they lie upon
        n.outgoingLinks.push(link);
        if (target.incomingLinks === undefined){
          console.log("what links?", n, targets, target);
        }
        target.incomingLinks.push(link);
        this.links.push(link);
      }
    },

    convertNodes: function(){

      ['people','projects','topics'].forEach(function(type){
        // convert each one into a node
        // instantiating tons of things in one line
        var len = this[type].length;
        for (var i=0; i < len; i++){
          this[type][i] = new app.Node(this[type][i]);
        }
      }, this);

    },

    // get a list of model items using ajax
    ajaxGetData: function(){
        var me = this;
        // order is important here
        this.modelNames.forEach(function(thing, i, arr){
            // do ajax for this thing
			// APP_ROOT is a defined global
            var url = APP_ROOT + thing + "/";
            $.ajax(url,{success:me.processAjaxSuccess(thing)});
        });
    },

    linkModels: function(){
        this.makeLinks('people', 'interests', 'topics');
        this.makeLinks('projects', 'countries', 'countries');
        this.makeLinks('projects', 'topics', 'topics');
        this.makeLinks('projects', 'people', 'people');
    },

    processAjaxSuccess: function(thing){
        var me = this;
        return function(data, textStatus, jqXHR){
            console.log("received data for", thing);
            me[thing] = data;
            me.ajaxes++;
            if (me.ajaxes == me.modelNames.length){
                console.log("finished all ajax, linking models");
                me.convertNodes();
                me.linkModels();
                console.log(me);
                app.onLoad();
            }
        }
    },

    buildGraph: function(){
      // add just the projects
      var len = this.projects.length;
      for (var i=0; i < len; i++){
        this.addNode(this.projects[i], ["people", "topics"]);
      }
    },

};


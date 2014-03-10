// name space!
define(

['jquery', 'Node'],

function($, Node){

var models = {

    modelNames: ['countries', 'topics', 'people', 'projects'],
    ajaxes: 0,
    nodes: [],
    links: [],

    init: function(callback){
		this.initCallback = callback;
        this.ajaxGetData();
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

	getItemByAttribute: function(model, attributeName, value){
        for (var i = this[model].length; i; i = i - 1){
            var m = this[model][i - 1];
            if (m[attributeName] == value){
                return m;
            }
        }
		return null;
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

    },


    addNode: function(n, connectingProperties){
      // first, add the node to nodes
      this.nodes.push(n);

      // get all it's targets.
      var targets = this.getAllConnecting(n, connectingProperties);
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
          this[type][i] = new Node(this[type][i]);
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
		this.linkCountriesToProjects();
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
                me.initCallback();
            }
		};
    },

	compareTopics: function(a, b){
		return - (a.numLinks() - b.numLinks());
	},

	sortTopics: function(){
	  this.topics.sort(this.compareTopics);
	},

	linkCountriesToProjects: function(){
		this.projects.forEach(function(project){
			if (project.countries.length > 0){
				project.countries.forEach(function(country){
					country.projects = country.projects || [];
					country.projects.push( project );
				});
			}
		});
	},

    buildGraph: function(){
      // add just the projects
      var len = this.projects.length;
      for (var i=0; i < len; i++){
        this.addNode(this.projects[i], ["people", "topics"]);
      }
    },


};

return models;

});

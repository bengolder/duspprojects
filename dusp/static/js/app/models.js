// name space!
var app = app || {};

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

app.Node = function(obj, i){
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
    obj.prototype = this.prototype;
    return obj;
};

app.Node.prototype = {

  getDisplayText: function(){
    return this.displayText;
  },

};

// we will make a singleton to hold all the data
app.models = {

    modelNames: ['countries', 'topics', 'people', 'projects'],
    ajaxes: 0,

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

    getAllConnecting: function(item){
      // this is only meant to be used on people or projects
      if (item.hasOwnProperty("full_name")){
        // it's a person
        return item.interests;
      } else {
        // it's a project
        return item.people.concat(item.topics);
      }
    },

    getAllNodes: function(){
      return this.people.concat(this.projects, this.topics);
    },

    getAllNodesRandomly: function(){
      return shuffle(this.getAllNodes());
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

    convertNodes: function(){

      ['people','projects','topics'].forEach(function(type){
        // convert each one into a node
        this[type].forEach(app.Node, app.Node);

      }, this);

    },

    // get a list of model items using ajax
    ajaxGetData: function(){
        var me = this;
        // order is important here
        this.modelNames.forEach(function(thing, i, arr){
            // do ajax for this thing
            var url = "/"+thing+"/";
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
};


// this thing could validate everything and edit the information before sending
// it to the server. That way the server only has to deal with preformatted
// objects


/*
Help Bubble & Validators for 
    Project
        Type
        Description
        People
        Partners
        website
        start and end year
        cities
        countries
        topics
    Person
        Official Title
        Picture
        Home Page
        Bio (allow markdown?)
        Interests
    Topic
        Title
        Description
        Collection
*/

var field_assistance = {
    selectors: ['ul.form.%s', '[name="%s"]'],
    models: {
        project: {
            title:{
                help: "Please include a short title for the project.",
            },
            type:{
                help: 'Examples: "Class", "Publication", "Research Group"',
            },
            description: {
                help: 'Please include a concise description of the project.',
            },
            people:{
                help: "A comma-separated list of other people involved in the project. This can only include other faculty fron DUSPExplorer. If you feel someone should be added, please contact bgolder@mit.edu",
            },
            partners:{
                help: "Here you can list collaborators or supporting organizations outside of DUSP.",
            },
            website:{
                help: "Optional. If you would like to provide a link to a project website, you may enter the website URL here.",
            },
            start_year:{
                help: "The year that the project began."
            },
            end_year:{
                help: "The year that the project ended. (For completed projects only)"
            },
            cities:{
                help: "Optional. A comma-separated list of cities where the project took place.",
            },
            countries:{
                help: "Optional. A comma-separated list of countries where the project took place. This will be used for the interactive globe visualization.", 
            },
            topics:{
                help: "A comma-separated list of topics that the project deals with. These topics are used to connect related projects in the visualizations. A topic will only be included in the visualizations if the topic is addressed by at least three projects. Please try to choose topics that are recognized by others.",
            },
        },
        topic: {
            title:{
                help: "The name of the topic. Should be lower case.",
            },
            description:{
                help: "A short description of what this topic is about.",
            },
            collection:{
                help: "We can use more than one set of topics. Collection 'a' is for topics added by faculty, on their own. Collection 'b' can be used for a curated selection of topics for the department.",
            },
        },
        person: {
            official_title:{
                help: 'Examples: "Assistant Professor", "Associate Professor"',
            },
            picture:{
                help: "Optional. A small profile picture.",
            },
            home_page:{
                help: "If you would like to include a link to your home page or some other personal website, you can enter the URL here.",
            },
            bio:{
                help: "A concise biography, written in the third person.",
            },
            interests:{
                help: "A comma-separated list of topics that you are interested in or actively researching. These topics are used to connect common interests in the visualizations. A topic will only be included in the visualizations if the topic is included by at least three people. Please try to choose topics that are recognized by others.",
            },
        },
    },
};

function split( val ) {
      return val.split( /,\s*/ );
}
function extractLast( term ) {
  return split( term ).pop();
}

function forEachInObj(obj, callback){
    var i = 0;
    for (var key in obj){
        if (obj.hasOwnProperty(key)){
            callback(key, obj[key], i,  obj);
            i++;
        }
    }
}

var fields = {
    "id_interests":topics,
    "id_topics":topics,
    "id_countries":countries,
    "id_cities":cities,
    "id_people":people,
};

forEachInObj(fields, function(id, set){
    var field = $('input#'+id);

    field.autocomplete({
        autoFocus: true,
        delay: 100,
        minLength: 1,
        source: function (request, response){
            // request contains comma separated values
            response( 
                $.ui.autocomplete.filter(
                    set, extractLast( request.term ) 
                ) 
            );},
        focus: function() {
                  // prevent value inserted on focus
                  return false;
                },
        select: function( event, ui ) {
                // ui.item gives me access to the selected object, and I can
                // call a function with it
                var terms = split( this.value );
                // remove the current input
                terms.pop();
                // add the selected item
                terms.push( ui.item.value );
                // add placeholder to get the comma-and-space at the end
                terms.push( "" );
                this.value = terms.join( ", " );
                return false;
              },

    });

});

function fieldFocus(definition){
    return function(e){
        var coords = $(this).offset();
        var w = $(this).width();
        var bubble = d3.select(this.parentNode)
            .insert('div', ':first-child')
            .attr("class", "helpBubble")
            .style("position", "absolute")
            .style("display", "none")
            .style("width", (w * 0.7) + 'px')
            .style("margin-left", (w * 0.3) + 'px');
        bubble.append("div").attr("class", "helpText")
            .html(definition.help);
        var $bubble = $(bubble.node());
        var h = $(bubble.node()).height();
        bubble.style("margin-top", -h + 'px');
        $bubble.fadeIn();
    };
}

function fieldBlur(definition){
    return function(e){
        var bubble = $(this.parentNode)
            .find('.helpBubble');
        bubble.fadeOut(200, function(){
            bubble.remove();
        });
    };
}

function fieldSetup($container, selector, definition){
    $container.on('focus', selector, fieldFocus(definition));
    $container.on('focusout', selector, fieldBlur(definition));
}

function setupFormAssistance(config){
    // get model form
    var selTemplate = config.selectors[0];
    for (var modelName in config.models){
        if (config.models.hasOwnProperty(modelName)){
            var modelSelector = selTemplate.replace('%s', modelName);
            var forms  = $(modelSelector);
            if (forms.length > 0){
                var fields = config.models[modelName];
                for (var field in fields){
                    if (fields.hasOwnProperty(field)){
                        var fieldSelector = config.selectors[1].replace('%s', field);
                        fieldSetup(forms, fieldSelector, fields[field]);
                    }
                }
            }
        }
    }
}

setupFormAssistance(field_assistance);







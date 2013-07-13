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

})










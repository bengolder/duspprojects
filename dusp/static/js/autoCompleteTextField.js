
// turn this into autocomplete fields
var selectIds = [
    "id_interests",
    "id_people",
    "id_cities",
    "id_countries",
    "id_topics",
]

function split( val ) {
      return val.split( /,\s*/ );
}
function extractLast( term ) {
  return split( term ).pop();
}


var field = $('input#id_interests');

field.autocomplete({
    autoFocus: true,
    delay: 100,
    minLength: 1,
    source: function (request, response){
        response( 
            $.ui.autocomplete.filter(
                topics, extractLast( request.term ) 
            ) 
        );},
    focus: function() {
              // prevent value inserted on focus
              return false;
            },
    select: function( event, ui ) {
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






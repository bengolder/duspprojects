(function ( $ ){
    var pattern = '';
    $.fn.autoCompleteTextField = function (options) {
        // sort options by score (higher is better)
        // on focus
        // listen for keydown events
        // use some regex to search through the options
        // append a div below the field
        // put the options in it, in a list
        // allow someone to scroll through the options, or to select them
        return this;
    };
}( $ ));

var options = [
    [3, "hello fries"],
    [8, "Baltimore"],
    [5, "New York City"],
    [5, "NY, NY"],
    [7, "NYC"],
    [2, "NYC, NY"],
    [1, "Boston, MA"],
    [4, "New Jack City"],
    [5, "New England"],
    [3, "Bangalore"],
    [1, "Bangle Tiger"],
    [14, "Beagle"],
    [11, "Fried Chicken"],
    [4, "Friends"],
    [2, "Englewood"],
    [4, "East Bay"],
    ];

function sortMethod(a, b){
    return b[0] - a[0];
}

function autoSetup(){
    options.sort(sortMethod);
    options.forEach(function (o, i){
        console.log(o[0], o[1]);
    });
}

function testRegex( c, i ){
    s += c;
    console.log("entered:", s);
    var reg = new RegExp( s, 'gi' );
    function matches(o){
        return o[1].match(reg);
    }
    console.log( options.filter(matches));

}

autoSetup();
var testSet1 = ["b","a","n"];
var testSet2 = ["f","r","i"];
var testSet3 = ["b","a","ñ"];
var s = "";
testSet1.forEach(testRegex);
var s = "";
testSet2.forEach(testRegex);
var s = "";
testSet3.forEach(testRegex);







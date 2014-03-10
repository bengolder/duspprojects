// app/topicCharts.js
define(
// optional dependencies
['models'],
function(models){

log = function(){
	var args = arguments;
	console.log.apply(console, args);
};

var module = { 

	main: function main(){
		models.init(this.onLoad);
	},

	onLoad: function onLoad(){
		models.buildGraph();
		log("models", models);
		log(models.topics[5]);
	},

};

return module;

});

var app = app || {};

var svg = d3.select("#chart");

log = function(){
	var args = arguments;
	console.log.apply(console, args);
};

app.models.init();

app.onLoad = function(){
	app.models.buildGraph();
	log("models", app.models);
	log(app.models.topics[2]);
}







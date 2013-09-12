app.globeView = {

	height: 960,
	width: 500,
	selectedCountry: null,
	landColor: app.colors.faded,
	selectedColor: app.colors.orange,

	shades: [
            "#57A5F5",
            "#5B8AD2",
            "#5971B0",
            "#51598F",
            ],
	ramp: function(n){
        this.shades[n-1];
	},

	projection: d3.geo.orthographic()
		.scale(248)
		.clipAngle(90);

	circumScale: d3.scale.linear()
			        .domain([0, this.width])
					.range([-210, 210]),

    pitchScale: d3.scale.linear()
				   .domain([0, this.height])
				   .range([60, -60]),

	takeover: function(){
		app.currentView = app.globeView;
		// this needs to effectively hide all the SVG
		// I should maybe send all the nodes to the center
		app.svg.style("display", "none");
	},

	collapse: function(newView){
		// this needs to return the SVG to normal
		app.svg.style("display", null);
		// maybe I should then reveal all the nodes at the center
	},

	initSVG: function(){
		this.canvas = d3.select("#chart").append("canvas")
			.attr("width", this.width)
			.attr("height", this.height);
		this.context = this.canvas.node().getContext("2d");
		this.path = d3.geo.path()
			.projection(this.projection)
			.context(this.context);

		this.canvas.on("mousemove", function(){
			// it would be nice to allow manual rotation
			var p = d3.mouse(this);
		});

	},


	loadData: function(){

		this.land = topojson.object(this.world,
				this.world.objects.land);

		this.countries = topojson.object(this.world,
				this.world.objects.countries).geometries;

		this.borders = topojson.mesh(this.world,
				this.world.objects.countries,
				function(a, b){ return a.id !== b.id; }
				);
	},

	buildCountryMenu: function(){
	},

	getCountryPoint: function(country){
		return d3.geo.centroid(country);
	},

	drawFill: function(color, pathItems){
		this.context.fillStyle = color;
		this.context.beginPath();
		this.path(pathItems);
		this.context.fill();
	},

	drawStroke: function(color, strokeWidth, pathItems){
		this.context.strokeStyle = color;
        this.context.lineWidth = strokeWidth;
        this.context.beginPath();
        this.path(pathItems);
        this.context.stroke();
	},

	drawGlobe: function(){
		// does all the drawing
		this.context.clearRect(0, 0, this.width, this.height);
		this.drawFill(this.landColor, this.land);

		// now draw each country according to its ramp
		/// countries.forEach(function(country, i){
            //if (country.projects.length > 0){
                //drawFill(ramp(country.projects.length), country);
            //}
        //});/

		drawFill(this.selectedColor, this.selectedCountry);
		drawStroke(app.colors.back, 0.5, this.borders);
		drawStroke(app.colors.text, 2, {type:"Sphere"});
	},

	setSize: function(){
		app.height = this.totalHeight;
		app.resizeSVG();
	},


};

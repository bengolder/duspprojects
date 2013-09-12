app.globeView = {

	world: world,
	height: app.grid.vus(30),
	width: app.grid.ems(24 * 4),
	selectedCountry: null,
	landColor: app.colors.text,
	selectedColor: app.colors.orange,

	shades: [
            "#57A5F5",
            "#5B8AD2",
            "#5971B0",
            "#51598F",
            ],

	setScales: function(){
		this.projection = d3.geo.orthographic()
								.scale(248)
								.clipAngle(90);

		this.circumScale = d3.scale.linear()
			        .domain([0, app.globeView.width])
					.range([-210, 210]);

		this.pitchScale = d3.scale.linear()
				   .domain([0, app.globeView.height])
				   .range([60, -60]);
	},

	ramp: function(n){
        this.shades[n-1];
	},

	takeover: function(){
		app.currentView = app.globeView;
		app.setSize();
		// this needs to effectively hide all the SVG
		// I should maybe send all the nodes to the center
		app.svg.style("display", "none");
		app.globeView.start();
	},

	collapse: function(newView){
		// this needs to return the SVG to normal
		app.svg.style("display", null);
		// maybe I should then reveal all the nodes at the center
		this.canvas.remove();
		newView.takeover();
	},

	initSVG: function(){
		this.canvas = d3.select("#chart").append("canvas")
			.attr("width", this.width)
			.attr("height", this.height)
			.style("margin-top", app.grid.vu + "px");
		this.context = this.canvas.node().getContext("2d");
		this.path = d3.geo.path()
			.projection(this.projection)
			.context(this.context);

		this.canvas.on("mousemove", function(){
			// it would be nice to allow manual rotation
			var p = d3.mouse(this);
			app.globeView.projection.rotate([
				app.globeView.circumScale(p[0]), 
				app.globeView.pitchScale(p[1])
				]);
			app.globeView.drawGlobe();
			console.log("p", p, "circum", app.globeView.circumScale(p[0]),
				"pitch", app.globeView.pitchScale(p[1]));
			});

	},

	start: function(){
		this.setScales();
		this.initSVG();
		this.loadData();
		this.buildCountryMenu();
		this.drawGlobe();
	},

	loadData: function(){

		this.land = topojson.feature(this.world,
				this.world.objects.land);

		this.countries = topojson.feature(this.world,
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

		this.drawFill(this.selectedColor, this.selectedCountry);
		this.drawStroke(app.colors.back, 0.5, this.borders);
		this.drawStroke(app.colors.text, 2, {type:"Sphere"});
	},

	setSize: function(){
	},


};

app.globeView = {
	world: world,
	height: app.grid.vus(30),
	width: app.grid.ems(24 * 4),
	selectedCountry: null,
	landColor: app.colors.dullText,
	selectedColor: app.colors.orange,

	setScales: function(){

		this.ramp = d3.scale.linear()
			.domain([0,4])
			.range(["#fff", app.colors.blue])
			.interpolate(d3.interpolateHsl);

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
			});
	},

	start: function(){
		this.loadData();
		this.setScales();
		this.initSVG();
		this.buildCountryMenu();
		this.drawGlobe();
	},

	loadData: function(){

		this.land = topojson.feature(this.world,
				this.world.objects.land);

		this.countries = topojson.feature(this.world,
				this.world.objects.countries).features;

		this.linkedCountries = [];

		this.borders = topojson.mesh(this.world,
				this.world.objects.countries,
				function(a, b){ return a.id !== b.id; }
				);

		var me = this;
		this.countries.forEach(function(country){
			var countryModel = app.models.getItemByAttribute("countries",
				"country_id", country.id);
			if (countryModel){
				if (countryModel.hasOwnProperty("projects")){
					// merge the model with the geometry
					$.extend(country, countryModel);
					// add it to the list of linked countries
					me.linkedCountries.push(country);
				}
			} else {
				console.log("couldn't find", country);
			}
		});

		this.linkedCountries.sort(function(a,b){
			return a.projects.length - b.projects.length;
		});

		console.log("countries", this.linkedCountries);
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
		var me = this;
		this.linkedCountries.forEach(function(country, i){
			if (country.projects.length > 0){
				me.drawFill(me.ramp(country.projects.length), country);
			}
		});

		this.drawFill(this.selectedColor, this.selectedCountry);
		this.drawStroke(app.colors.back, 0.5, this.borders);
		this.drawStroke(this.landColor, 2, {type:"Sphere"});
	},

	setSize: function(){
	},


};

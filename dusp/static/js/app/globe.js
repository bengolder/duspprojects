app.globeView = {
	world: world,
	height: app.grid.vus(30),
	width: app.grid.ems(24 * 3),
	selectedCountry: null,
	landColor: app.colors.fade(app.colors.text, 0.4),
	selectedColor: app.colors.orange,

	setScales: function(){

		this.ramp = d3.scale.linear()
			.domain([0,4])
			.range([app.colors.blue, "#002E57"])
			.interpolate(d3.interpolateHsl);

		this.projection = d3.geo.orthographic()
								.scale(230)
								.clipAngle(90);

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
		d3.select(".projectlistWrapper").remove();
		d3.select(".countryMenuWrapper").remove();
	},

	initSVG: function(){
		this.canvas = d3.select("#chart").append("canvas")
			.attr("width", this.width)
			.attr("height", this.height)
			.style("margin-top", app.grid.vu + "px")
			.style("margin-left", -app.grid.ems(4) + "px");
		this.context = this.canvas.node().getContext("2d");

		this.path = d3.geo.path()
			.projection(this.projection)
			.pointRadius(5)
			.context(this.context);

		this.buildCountryMenu();
	},

	start: function(){
		this.loadData();
		this.setScales();
		this.initSVG();
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
			} 
		});

		var singapore = $.extend({
			type:"Feature",
			properties: {},
			geometry:{
				type: "Point",
				coordinates: [103.8, 1.3],
			}
		}, app.models.getItemByAttribute("countries",
				"name", "Singapore"));

		this.linkedCountries.push(singapore);

		this.linkedCountries.sort(function(a,b){
			return b.projects.length - a.projects.length;
		});

	},

	tweenToPoint: function(point){
		var me = this;
		return function(){
            // This function returns a tweening function for rotating the globe
            var rotator = d3.interpolate(me.projection.rotate(), 
                    [-point[0], -point[1]]
                    );

            return function(t) {
                me.projection.rotate(rotator(t));
                me.drawGlobe();
            };
        };
	},

	handleCountryClick: function(){
		var me = this;
		return function(d){
			// set the selected country
			me.selectedCountry = d;
			d3.selectAll(".country")
				.style("color", function(c){
				  return me.ramp(c.projects.length);
				});
			// show projects for that country
			d3.select(this).style("color", app.colors.orange);
			var p = me.getCountryPoint(d);
			var movement = d3.transition()
				.duration(1000)
				.tween("rotate", me.tweenToPoint(p));
			movement.transition();
			me.updateProjects(d);
		};
	},

	updateProjects: function(country){
		d3.select(".projectlistWrapper").remove();
		var list = d3.select("#chart").append("div")
			.attr("class", "projectlistWrapper")
			.append("div")
			.attr("class", "projectlist");

		list.append("div")
			.attr("class", "countryName")
			.text(country.name);

		var projects = list.selectAll("countryProject")
			.data(country.projects).enter()
			.append("div")
			.attr("class", "countryProject");
		
		projects.append("div")
			.attr("class", "title")
			.text(function(d){
				return d.title;
			});
		
		projects.append("div")
			.attr("class", "description")
			.text(function(d){ return d.description; });

		var people = projects.append("div")
			.attr("class", "faculty");

		people.append("span")
			.attr("class", "term")
			.text("faculty: ");

		people.append("span")
			.attr("class", "people")
			.text(function(d){
				var names = d.people.map(function(p){
					return p.displayText;
				});
				return names.join(", ");
			});

		var partners = projects.append("div")
			.attr("class", "partners")
		partners.append("span")
			.attr("class", "term")
			.text("partners: ");
		partners.append("span")
			.attr("class", "partnerList")
			.text(function(d){return d.partners;});

		$(".projectlist").slimScroll({
		  height: app.grid.vus(15),
		});
	},

	buildCountryMenu: function(){
      this.menu = d3.select("#chart").append("div")
		  .attr("class", "countryMenuWrapper").append("div")
        .attr("class", "countryMenu");

	  // add the nice thin scrollbar
	  $(".countryMenu").slimScroll({
		  height: app.grid.vus(15),
	  });

	  var me = this;
	  this.menu.selectAll(".country")
		  .data(this.linkedCountries)
		  .enter().append("div")
		  .attr("class", "country")
		  .style("color", function(d){
			  return me.ramp(d.projects.length);
		  })
		  .text(function(d){
			  return d.name;
		  }).on("mouseenter", function(d){
			  d3.select(this).style("color", app.colors.orange);
		  }).on("mouseleave", function(d){
			  if (d == app.globeView.selectedCountry){
			  } else {
				  d3.select(this).style("color", 
					  me.ramp(d.projects.length));
			  }
		  }).on("click", this.handleCountryClick());
		
	},

	getCountryPoint: function(country){
		if (country.geometry.type == "Point"){
			return country.geometry.coordinates;
		} else {
		return d3.geo.centroid(country);
		}
	},

	drawFill: function(color, pathItems){
		this.context.fillStyle = color;
		this.context.beginPath();
		this.path(pathItems);
		this.context.fill();
	},

	drawCircle: function(color, pointItem){
		// draw fill
		this.context.fillStyle = color;
		this.context.beginPath();
		this.path(pointItem);
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
				if (country.geometry.type == "Point"){
					me.drawCircle(me.ramp(country.projects.length), country);
				} else {
					me.drawFill(me.ramp(country.projects.length), country);
				}
			}
		});

		if (this.selectedCountry){
			if (this.selectedCountry.geometry.type == "Point"){
				this.drawCircle(this.selectedColor, this.selectedCountry);
			} else {
				this.drawFill(this.selectedColor, this.selectedCountry);
			}
		}
		this.drawStroke(app.colors.back, 0.5, this.borders);
		this.drawStroke(this.landColor, 2, {type:"Sphere"});
	},

	setSize: function(){
	},

};

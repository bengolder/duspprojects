


var app = app || {};

app.auth = {

	init: function(){
		log('init auth');
		d3.select("#login-link").on(
				'click', 
				this.presentLoginForm );
	},

	presentLoginForm: function(d, i){

		log("starting log in");
		var form = d3.select("body").append("div")
			.attr("class", "overlay")
			.append("form")
			.attr("class", "login-form");

		form.append("div")
			.attr("class", "login-header")
			.text("Faculty/Staff Login");

		form.append("div")
			.attr("class", "field-row")
			.append("input")
			.attr("type", "text")
			.attr("class", "username-field");

		form.append("div")
			.attr("class", "field-row")
			.append("input")
			.attr("type", "password")
			.attr("class", "password-field");

		form.append("div")
			.attr("class", "field-row")
			.append("input")
			.attr("type", "button")
			.attr("value", "login")
			.attr("class", "submit-button");

	},

};

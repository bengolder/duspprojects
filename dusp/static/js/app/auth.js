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
			.attr("class", "login-form")
			.attr("method", "post")
			.attr("action", "/index/");

		form.append("input")
			.attr("type", "hidden")
			.attr("name", "csrfmiddlewaretoken")
			.attr("value", csrftoken);

		form.append("div")
			.attr("class", "login-header")
			.text("Faculty/Staff Login");

		form.append("div")
			.attr("class", "field-row")
			.append("input")
			.attr("type", "text")
			.attr("name", "user")
			.attr("class", "username-field");

		form.append("div")
			.attr("class", "field-row")
			.append("input")
			.attr("type", "password")
			.attr("name", "password")
			.attr("class", "password-field");

		var submit = form.append("div")
			.attr("class", "field-row")
			.append("input")
			.attr("type", "submit")
			.attr("value", "login")
			.attr("class", "submit-button");
	},

};

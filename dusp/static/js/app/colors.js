define(
['d3'],
function(d3){

var colors = {
    text: "#1A1A1A",
    projectsBase: "#999999",
    peopleBase: "#FF4010",
    topicsBase: "#0785FF",
	back: "#F7F7F7",
	fade: function(color, fraction){
		var c = d3.rgb(color);
		return "rgba("+ [c.r, c.g, c.b].join(",") +","+ fraction + ")";
	},
};

colors.blue = colors.topicsBase;
colors.orange = colors.peopleBase;

return colors;
});

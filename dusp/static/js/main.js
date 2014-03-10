requirejs.config({
    baseUrl: STATIC_ROOT + 'js/app',
    paths: {
        jquery: '../jquery-1.9.1',
		d3: '../d3.v3',
    }
});

requirejs(

['topicCharts'], function (topicCharts) {

	console.log(topicCharts);
	topicCharts.main();

}
);

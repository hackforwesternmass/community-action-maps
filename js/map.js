$(function() {
	var map = L.map('map').setView([42.369373, -72.639241], 10);
	L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
	}).addTo(map);
	L.geoJson(communityactionarea, {
		style: {color: "#4e6c9b"}
	}).addTo(map);
	// Bind to zoom/pan information
	// For development ease, remove on deploy.
	map.on("zoomend", function(){console.log(map.getZoom())});
	map.on("moveend", function(){console.log(map.getCenter().toString())});
})

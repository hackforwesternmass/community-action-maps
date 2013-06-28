var serviceAreaCenter = [42.369373, -72.639241];
var map;
var layerStack = [];  // holds initial collection of layers
var layerControl = new L.Control.Layers();
function scaleData(data, dataMin, dataMax) { return dataMax == dataMin ? 0.5 : (data - dataMin)/(dataMax - dataMin) };  // scales data between 0 and 1
function poverty_hashes(feature)  // Assumes a census tract feature
{
	var bracket = 0;
	var pov_pct = tracts[feature.properties.TRACTCE10].poverty;
	if        (pov_pct < 0.05) {
		bracket = 0;
	} else if (pov_pct < 0.15) {
		bracket = 1;
	} else if (pov_pct < 0.25) {
		bracket = 2;
	} else {
		bracket = 3;
	}
	var fillColor = 'url(#hatches' + bracket + ')';
	return { color: '#000000', opacity: 1, fillColor: fillColor, weight: 0.2, fillOpacity: 1 };
}
var map_overlay_colors = [ '#f6d86c', '#f5af5e', '#f17b3c', '#f74c4c' ];
var map_overlay_alpha_colors = []; // set by function below based on colors above
var map_overlay_opacity = 1; // set by function below based on colors above
(function () {
	var digits = '0123456789abcdef';
	var i2h = function (component) {
		return digits.substr(Math.floor(component / 16), 1) + digits.substr(component % 16, 1);
	}
	var h2i = function (component) {
		return 16 * digits.indexOf(component.substr(0, 1)) + digits.indexOf(component.substr(1, 1));
	}
	var colors = []
	for (i in map_overlay_colors) {
		colors.push(h2i(map_overlay_colors[i].substr(1, 2)));
		colors.push(h2i(map_overlay_colors[i].substr(3, 2)));
		colors.push(h2i(map_overlay_colors[i].substr(5, 2)));
	}
	var alpha = 254;
	for (i in colors) {
		if (colors[i] < alpha) {
			alpha = colors[i];
		}
	}
	for (i in colors) {
		colors[i] = (colors[i] - alpha) * 255 / (255 - alpha)
	}
	while (colors.length > 0) {
		color = '#';
		for (i = 0; i < 3; ++i) {
			color += i2h(colors.shift());
		}
		map_overlay_alpha_colors.push(color);
	}
	map_overlay_opacity = (255 - alpha) / 255;
})();
function head_start_colors(feature)  // Assumes a census tract feature
{
	var fill;
	var tract = feature.properties.TRACTCE10;
	var hs_pct = tracts[tract].headstart;
	if        (hs_pct < 0.01) {
		fill = map_overlay_alpha_colors[0];
	} else if (hs_pct < 0.05) {
		fill = map_overlay_alpha_colors[1];
	} else if (hs_pct < 0.10) {
		fill = map_overlay_alpha_colors[2];
	} else {
		fill = map_overlay_alpha_colors[3];
	}
	return { color: fill, opacity: map_overlay_opacity, fillColor: fill, weight: 0, fillOpacity: map_overlay_opacity };
}
// Data to put on map initially; first -> last : front to back
var geoJSONStack = [
	{
		layerURL: 'geography/CommunityActionSites.json',
		properties: {
			style: { color: '#4E6C9B', opacity: 1 },
			onEachFeature: function (feature, layer) {
				layer.bindPopup('<b>Community Action Office:</b> ' + feature.properties.Site +
					'<br /><b>Address:</b> ' + feature.properties.Street +
					', ' + feature.properties.City +
					', ' + feature.properties.State +
					'<br /><b>Services:</b> ' + feature.properties.Services
				)
			}
		},
		controlName: '<span style="color: #4E6C9B;">Community Action Offices &bull;</span>'
	},
	//{
	//	layerURL: 'geography/CommunityActionServiceArea.json',
	//	properties: { style: { color: '#4E6C9B', fill: false, weight: 7, opacity: 1 } },
	//	controlName: '<span style="color: #4E6C9B;">Service Area &#x2501;&#x2501;&#x2501;&#x2501;</span>'
	//},
	//{
	//	layerURL: 'geography/USStates.json',
	//	properties: { style: { color: 'purple', fill: false, weight: 3, dashArray: '5,5' } },
	//	controlName: '<span style="color: purple;">States &#x257A;&#x2578;&nbsp;&#x257A;&#x2578;&#x257A;&#x2578;</span>'
	//},
	{
		layerURL: 'geography/MassachusettsCounties.json',
		properties: { style: { color: 'black', fill: false, weight: 3 } },
		controlName: '<span style="color: black">Counties &#x2501;&#x2501;&#x2501;&#x2501;</span>'
	},
	{
		layerURL: 'geography/MassachusettsTownsCities.json',
		properties: { style: { color: 'black', fill: false, weight: 1 } },
		controlName: '<span style="color: black">Towns and Cities &#x2500;&#x2500;&#x2500;&#x2500;</span>'
	},
	{
		layerURL: 'geography/CommunityActionTracts.json',
		properties: {
			style: poverty_hashes,
			onEachFeature: function (feature, layer) {
				var tract = feature.properties.TRACTCE10;
				if (!tracts[tract]) {
					tracts[tract] = { poverty: 0, headstart: 0 }
				}
				layer.bindPopup('Census Tract: ' + tract +
					'<br />Poverty Rate: ' + Math.round(tracts[tract].poverty * 100) + '%' +
					'<br />Head Start Recipients: ' + Math.round(tracts[tract].headstart * 100) + '%')
			}
		},
		controlName: '<span style="color: ' + map_overlay_colors[2] + '">Poverty in Census Tracts </span>'
	},
	{
		layerURL: 'geography/CommunityActionTracts.json',
		properties: {
			style: head_start_colors
		},
		controlName: '<span style="color: ' + map_overlay_colors[2] + '">Community Action Data </span>' +
			'<span style="color: ' + map_overlay_colors[0] + '">&#x2588;</span>' +
			'<span style="color: ' + map_overlay_colors[1] + '">&#x2588;</span>' +
			'<span style="color: ' + map_overlay_colors[2] + '">&#x2588;</span>' +
			'<span style="color: ' + map_overlay_colors[3] + '">&#x2588;</span>'
	}
]
function mapLayerStack(geoJSON)
{
	if (geoJSON)  // produced by $.getJSON, this is a reference to the data that is now available
	{
		var layerData = geoJSONStack.pop();
		var layer = new L.geoJson(geoJSON, layerData.properties);
		layer.addTo(map);
		layerControl.addOverlay(layer, layerData.controlName);
		layerStack.push(layer);  // store reference
	}
	if (geoJSONStack.length > 0) {  // Recurse until the stack is empty
		$.getJSON(geoJSONStack[geoJSONStack.length-1].layerURL, mapLayerStack);
	} else {
		layerControl.addTo(map);
	}
}

// Call to Census API to obtain particular data sets.
var censusCountyStack = [ '011', '013', '015' ];  // holds FIPS ID of counties of interest
var censusYear = '2011';
var censusDataset = 'acs5';  // American Community Survey 5-year estimates
var censusKey = '45eb040aa8066098e3844a5e2fa9bf100de52774';
// Values below for total population and population in poverty estimates
var censusGeoTypeStack = ['*', '812201,812202,812300,812401,812403,812404,812500,812600,812701,812702,812800,812901,812902,812903,813000,813101,813102,813204,813205,813206,813207,813208,813209', '*'];
var censusState = '25';
var povertyFields = 'B17001_001E,B17001_002E';  // comma-separated list of field references
var tracts = { };
var ca_data = { };

function getData() {
	$.getJSON('community-action-data/recipients_per_tract.json', function(data) {
		ca_data = data;

		// FIXME delete this loop when we have real numbers
		for (tract in ca_data) {
			ca_data[tract] *= 30;
		}

		getCensus();
	});
}

// The census data is being used to "paint" the tract data, hence it’s loaded first, and when complete calls the map stack
function getCensus(censusData)
{
	if (censusData)  // called by $.getJSON, this is a reference to the data that is now available
	{
		var censusDataRow, tract, population;
		for (i = 1; i < censusData.length; i++)
		{
			censusDataRow = censusData[i];
			tract = censusDataRow[4];
			population = censusDataRow[0];
			tracts[tract] = { poverty: 0, headstart: 0 }
			if (population > 0) {
				tracts[tract].poverty = censusDataRow[1] / population
				if (ca_data[tract]) {
					tracts[tract].headstart = ca_data[tract] / population
				}
			}
		}
	}
	if (censusCountyStack.length > 0)  // Recurse until the stack is empty
	{
		var censusCounty = censusCountyStack.pop();
		var censusGeoType = censusGeoTypeStack.pop();
		var censusURL = 'http://api.census.gov/data/' + censusYear + '/' + censusDataset + '?key=' + censusKey + '&get=' + povertyFields + '&for=tract:' + censusGeoType + '&in=state:' + censusState + '+county:' + censusCounty;
		// use local cache (comment out next line to use live data again)
		censusURL = 'census-cache/' + censusYear + '-' + censusCounty + '.json'
		$.getJSON(censusURL, getCensus);
	}
	else
	{
		var censusInfo = document.getElementById('censusInfo');
		censusInfo.innerHTML = '';
		for (key in tracts) {
			censusInfo.innerHTML += key + '&nbsp;&nbsp;&nbsp;&nbsp;' + Math.round(tracts[key].poverty *100) + '%<br />';
		}
		mapLayerStack();  // now load the geographies; first call no arguments
	}
}


map = L.map('map').setView(serviceAreaCenter, 10);
L.tileLayer(
	// 'http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png',
	'http://a.tiles.mapbox.com/v3/jasonwoof.map-f2zc6iis/{z}/{x}/{y}.png',
	{
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
		maxZoom: 18,
		key: 'e6019ae203c94b6ab1a75bb300cd1f33',
		styleId: 1 //1
	}
).addTo(map);
L.control.scale().addTo(map);
map.doubleClickZoom.enable();

// start downloading the data, which then triggers adding the overlays
getData();

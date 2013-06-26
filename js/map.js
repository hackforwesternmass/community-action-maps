var poverty_high_color = {hue: 0, saturation: 0.69, value: 0.97};
var poverty_low_color = {hue: 47, saturation: 0.56, value: 0.96};
var serviceAreaCenter = [42.369373, -72.639241];
var fuelGaugeIcon = L.icon({
								iconUrl: 'fuel_gauge_www.fotosearch.com.jpg',
								iconSize: [46, 32],
								/*iconRetinaUrl: 'my-icon@2x.png',
								iconAnchor: [22, 94],
								popupAnchor: [-3, -76],
								shadowUrl: 'my-icon-shadow.png',
								shadowRetinaUrl: 'my-icon-shadow@2x.png',
								shadowSize: [68, 95],
								shadowAnchor: [22, 94]*/
							});
var map;
var layerStack = [];	// holds initial collection of layers
var layerControl = new L.Control.Layers();
function scaleData(data, dataMin, dataMax) { return dataMax == dataMin ? 0.5 : (data - dataMin)/(dataMax - dataMin) };	// scales data between 0 and 1
function tractColorFunction(feature)	// Assumes a census tract feature
{
	//var fillColor = value_to_color(scaleData(poverty[feature.properties.GEOID10], povertyMin, povertyMax), poverty_high_color, poverty_low_color);
	var fillColor = 'url(#hatches' + Math.floor(scaleData(poverty[feature.properties.GEOID10], povertyMin, povertyMax) * 4) + ')';
	return { color: '#000000', opacity: 1, fillColor: fillColor, weight: 1, fillOpacity: 1 };
}
// Data to put on map initially; first -> last : front to back
var geoJSONStack = [
		{
			layerURL: 'geography/CommunityActionSites.json',
			properties: { 
							style:  { color: '#4E6C9B', opacity: 1 }, 
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
		{
			layerURL: 'geography/CommunityActionServiceArea.json',
			properties: { style: { color: '#4E6C9B', fill: false, weight: 7, opacity: 1 } },
			controlName: '<span style="color: #4E6C9B;">Service Area &#x2501;&#x2501;&#x2501;&#x2501;</span>'
		},
		{
			layerURL: 'geography/USStates.json',
			properties: { style: { color: 'purple', fill: false, weight: 3, dashArray: '5,5' } },
			controlName: '<span style="color: purple;">States &#x257A;&#x2578;&nbsp;&#x257A;&#x2578;&#x257A;&#x2578;</span>'
		},
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
							style: tractColorFunction, 
							onEachFeature: function (feature, layer) { 
								layer.bindPopup('Census Tract: ' + feature.properties.GEOID10 + 
									'<br />Poverty Rate: ' + Math.round(poverty[feature.properties.GEOID10] * 100) + '%') 
								} 
						},
			controlName: '<span style="color: ' + value_to_color(0.5, poverty_high_color, poverty_low_color) + '">Poverty in Census Tracts </span>' + 
				'<span style="color: ' + value_to_color(0, poverty_high_color, poverty_low_color) + '">&#x2588;</span>' + 
				'<span style="color: ' + value_to_color(0.33, poverty_high_color, poverty_low_color) + '">&#x2588;</span>' + 
				'<span style="color: ' + value_to_color(0.67, poverty_high_color, poverty_low_color) + '">&#x2588;</span>' + 
				'<span style="color: ' + value_to_color(1.00, poverty_high_color, poverty_low_color) + '">&#x2588;</span>'
		}
	]
function mapLayerStack(geoJSON)
{
	if (geoJSON)	// produced by $.getJSON, this is a reference to the data that is now available
	{
		var layerData = geoJSONStack.pop();
		var layer = new L.geoJson(geoJSON, layerData.properties);
		layer.addTo(map);
		layerControl.addOverlay(layer, layerData.controlName);
		layerStack.push(layer);	// store reference
	}
	if (geoJSONStack.length > 0)	// Recurse until the stack is empty
		$.getJSON(geoJSONStack[geoJSONStack.length-1].layerURL, mapLayerStack);
	else
		layerControl.addTo(map);
}

// Call to Census API to obtain particular data sets.
var censusCountyStack = [ '011', '013', '015' ];	// holds FIPS ID of counties of interest
var censusYear = '2011';
var censusDataset = 'acs5';	// American Community Survey 5-year estimates
var censusKey = '45eb040aa8066098e3844a5e2fa9bf100de52774';
// Values below for total population and population in poverty estimates
var censusGeoTypeStack = ['*', '812201,812202,812300,812401,812403,812404,812500,812600,812701,812702,812800,812901,812902,812903,' +
						'813000,813101,813102,813204,813205,813206,813207,813208,813209', '*'];
var censusState = '25';
var povertyFields = 'B17001_001E,B17001_002E';	// comma-separated list of field references
var poverty = { };
var povertyMin = 1;
var povertyMax = 0;

// The census data is being used to "paint" the tract data, hence it’s loaded first, and when complete calls the map stack
function getCensus(censusData)
{
	if (censusData)	// called by $.getJSON, this is a reference to the data that is now available
	{
		var censusDataRow, GEOID10;
		for (i = 1; i < censusData.length; i++)
		{
			censusDataRow = censusData[i];
			GEOID10 = censusDataRow[2] + censusDataRow[3] + censusDataRow[4];
			poverty[GEOID10] = censusDataRow[0] > 0 ? censusDataRow[1] / censusDataRow[0] : 0
			povertyMin = Math.min(povertyMin, poverty[GEOID10]);
			povertyMax = Math.max(povertyMax, poverty[GEOID10]);
		}
	}
	if (censusCountyStack.length > 0)	// Recurse until the stack is empty
	{
		var censusCounty = censusCountyStack.pop();
		var censusGeoType = censusGeoTypeStack.pop();
		var censusURL = 'http://api.census.gov/data/' + censusYear + '/' + censusDataset + '?key=' + censusKey + 
			'&get=' + povertyFields + '&for=tract:' + censusGeoType + '&in=state:' + censusState + '+county:' + censusCounty;
		// use local cache (comment out next line to use live data again)
		censusURL = 'census-cache/' + censusYear + '-' + censusCounty + '.json'
		$.getJSON(censusURL, getCensus);
	}
	else
	{
		var censusInfo = document.getElementById('censusInfo');
		censusInfo.innerHTML = '';
		for (key in poverty)
			censusInfo.innerHTML += key + '&nbsp;&nbsp;&nbsp;&nbsp;' + Math.round(poverty[key] *100) + '%<br />';
		mapLayerStack();	// now load the geographies; first call no arguments
	}
}


//window.alert('stuff'); //serviceArea['type']);
map = L.map('map').setView(serviceAreaCenter, 9);
L.tileLayer(
	'http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png', 
	{
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
		maxZoom: 18,
		key: 'e6019ae203c94b6ab1a75bb300cd1f33',
		styleId: 1 //1
	}
).addTo(map);
getCensus();
//L.marker(serviceAreaCenter, { title: 'Community ACTION Service Area', icon: fuelGaugeIcon } ).addTo(map)
//map.on( "click", onClick() );
L.control.scale().addTo(map);
map.doubleClickZoom.enable();
//testing line:
//map.on('layeradd', function(layerEvent) { window.alert('Has layer: ' + map.hasLayer(layerEvent.layer)); });

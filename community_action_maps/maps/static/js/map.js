var map = L.map('map').setView([42.369373, -72.639241], 10);

L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'}).addTo(map);

L.geoJson(communityactionarea, {
    style: {color: "#4e6c9b"}
}).addTo(map);

var biggest_tract = _.max(data,function(d) { return d.properties["Count"]});
var max = biggest_tract.properties["Count"];

function getColor(fips) {
    var tract = _.find(data, function(obj) { return obj.properties["FIPS"] == fips});
    var count = 0;
    if (tract) {
        count = tract.properties["Count"];
    }
    return  count > max*3/4  ? '#f74c4c' :
            count > max/2    ? '#f17b3c' :
            count > max/4    ? '#f5af5e' :
            count > 0        ? '#f6d86c' :
                               'transparent';
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.GEOID10),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

L.geoJson(community_action_tracts, {style:  style}).addTo(map);

// Bind to zoom/pan information
// For development ease, remove on deploy.
map.on("zoomend", function(){console.log(map.getZoom())});
map.on("moveend", function(){console.log(map.getCenter().toString())});

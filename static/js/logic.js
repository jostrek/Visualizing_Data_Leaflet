var usCoords = [37.090240,-95.712891];
var mapZoomLevel = 5;

// Creating map object
var map = L.map("map-id", {
  center: usCoords,
  zoom: mapZoomLevel
});

// Adding tile layer
L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets",
  accessToken: API_KEY
}).addTo(map);


//markers should reflect the magnitude of the earthquake in their color. 
function getColor(d) {
  return d > 5 ? '#800026' :
         d > 4  ? '#BD0026' :
         d > 3  ? '#FF8C00' :
         d > 2  ? '#FFFF66' :
         d > 1   ? '#ADFF2F' :
                    '#7CFC00';
}

function createMarkers(response)
{
  L.geoJson(response, {
    // Style each feature (in this case a neighborhood)
    style: function(feature) {
      return {
        //markers should reflect the magnitude of the earthquake in their size and color. 
        fillColor: getColor(feature.properties.mag),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7,
        radius:feature.properties.mag*10,
      };
    },
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    onEachFeature: function(feature, layer) {
      // Set mouse events to change map styling
      layer.on({
        // When a user's mouse touches a map feature, the mouseover event calls this function; that feature's opacity changes to 90% so that it stands out
        mouseover: function(event) {
          layer = event.target;
          layer.setStyle({
            fillOpacity: 0.9
          });
        },
        // When the cursor no longer hovers over a map feature - when the mouseout event occurs - the feature's opacity reverts back to 50%
        mouseout: function(event) {
          layer = event.target;
          layer.setStyle({
            fillOpacity: 0.5
          });
        },
      });
      // Giving each feature a pop-up with information pertinent to it
      layer.bindPopup(`<h2>Magnitude:${feature.properties.mag}</h2><hr>
                      <h3>${feature.properties.title}</h3><hr>
                      Place:<h4>${feature.properties.place}</h4>`)
    }
  }).addTo(map);
}

//Legend
var legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0,1,2,3,4,5],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};
legend.addTo(map);

//The USGS provides earthquake data in a number of different formats, Updated every day.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson").then(createMarkers);

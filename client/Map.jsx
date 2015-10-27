Map = React.createClass({
  // invoked once on the client after rendering occurs!
  // --> meaning div for which to load the map will already be there
  componentDidMount: function() {
    // TODO: set map as state variable
    self = this
    self.L = L
    self.map = self.L.map('map').setView(new L.LatLng(21.146633, 79.088860), 5);
    var tiles = self.L.tileLayer.provider('Esri.WorldPhysical');
    // Alternatives: Esri.(WorldStreetMap|WorldTopoMap|WorldImagery)
    tiles.addTo(self.map);
    self.baseLayerObj = {
      "Tiles" : tiles
    };
    self.overlayDep = new Deps.Dependency();
    self.overlayCountdown = 3;
    self.overlays = self.L.layerGroup().addTo(self.map);
    self.overlayObj = {};
    /*
    //self.baseDep = new Deps.Dependency();
    //self.baseLayer = L.layerGroup().addTo(self.map);
    TODO: integrate india topojson into states topojson
    HTTP.get(Meteor.absoluteUrl("/india.json"), function(err, result) {
      var india = result.content;
      var indiastyle = {
        color: "#000",
        weight: 3,
        opacity: 1,
        fillOpacity: 0.0,
        fillColor: "#f0f0f0"
      };
      indiaL = omnivore.topojson.parse(india);
      indiaL.setStyle(indiastyle);
      indiaL.addTo(self.baseLayer);
      self.baseLayerObj.India = indiaL;
      self.baseDep.changed();
    });*/   

    HTTP.get(Meteor.absoluteUrl("/states.json"), function(err, result) {
      var states = result.content;
      var statestyle = {
        color: "#ff6600",
        weight: 2,
        opacity: 0.7,
        fillOpacity: 0.7,
        fillColor: "#fb7d05" //ffa500
      };
      statesL = omnivore.topojson.parse(states);
      statesL.setStyle(statestyle);
      statesL.addTo(self.overlays);
      self.overlayObj['States'] = statesL;
      console.log(self.overlayObj)
      self.overlayCountdown -= 1;
      console.log(self.overlayCountdown)
      if(self.overlayCountdown == 0) {
        console.log('Changing overlay dependency status..')
        self.overlayDep.changed();
      }
    });    

    HTTP.get(Meteor.absoluteUrl("/districts.json"), function(err, result) {
      var districts = result.content;
      var diststyle = {
        color: "#ddd",
        weight: 2,
        opacity: 0.5,
        fillOpacity: 0.8,
        fillColor: "#ffffff" //ffa500
      };
      districtL = omnivore.topojson.parse(districts);
      districtL.setStyle(diststyle);
      districtL.addTo(self.overlays);
      self.overlayObj['Districts'] = districtL;
      console.log(self.overlayObj)
      self.overlayCountdown -= 1;
      console.log(self.overlayCountdown)
      if(self.overlayCountdown == 0) {
        console.log('Changing overlay dependency status..')
        self.overlayDep.changed();
      }
    });   

    HTTP.get(Meteor.absoluteUrl("/markets.geojson"), function(err, result) {
      markets = JSON.parse(result.content);
      //console.log(markets)
      var markerStyle = {
        color: "#01a000",
        fillColor: "#02b300"
      };
      var marketL = self.L.geoJson(markets['features'], {
        style: markerStyle,
        pointToLayer: function(feature, latlng) {
          return new L.CircleMarker(latlng, {radius: 5, fillOpacity: 1, weight: 1});
        },
        onEachFeature: function(feature, layer) {
          layer.bindPopup(feature.properties.name + ', ' + feature.properties.district);
        }
      });
      self.overlayObj['Markets'] = marketL;
      marketL.addTo(self.overlays);
      self.overlayCountdown -= 1;
      console.log(self.overlayCountdown)
      if(self.overlayCountdown == 0) {
        console.log('Changing overlay dependency status..')
        self.overlayDep.changed();
      }
    });
    /*
    These Meteor functions run your code as a reactive computation:
      Templates, ***Deps.autorun***, UI.render and UI.renderWithData
    */
    Deps.autorun(function(c) {
      self.overlayDep.depend(); 
      console.log('accessing overlay object..')
      console.log(self.overlayObj)
      var control = self.L.control.layers(self.baseLayerObj, self.overlayObj)
      control.addTo(self.map);
    })
  },

  render: function() {
	return (
		<div id='map' />
	);
  }
});
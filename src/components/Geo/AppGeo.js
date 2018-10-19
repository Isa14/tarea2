import React from "react";
import "./AppGeo.less";
import PropTypes from "prop-types";
import { loadModules } from 'esri-loader';

const options = {
  url: 'https://js.arcgis.com/4.9/'
};

class AppGeo extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			zoom: 14,
			latitude: 38.889931,
      longitude: -77.009003,
			lista_coordenadas: [],
			buffer: []
    };
    this.setArrayCoordinates = this.setArrayCoordinates.bind(this);
  }

  setArrayCoordinates(event) {
		var address_name = event.searchTerm;
		var geometry = event.results[0].results[0].feature.geometry;
		var puntos = { "coord": { "lat": geometry.latitude, "lng": geometry.longitude }, "address": address_name };
		console.log("LALALALA");
		console.log(puntos);
    this.setState({
      lista_coordenadas: this.state.lista_coordenadas + puntos
    });
	}

	componentDidUpdate() {
		console.log(this.state.lista_coordenadas);
	}

	componentDidMount() {

		loadModules([
			"esri/Map",
			"esri/views/MapView",
			"esri/Graphic",
			"esri/layers/GraphicsLayer",
			"esri/tasks/RouteTask",
			"esri/tasks/support/RouteParameters",
			"esri/tasks/support/FeatureSet",
      'esri/widgets/Search'
		], options)
		.then(([Map, MapView, Graphic, GraphicsLayer, RouteTask, RouteParameters, FeatureSet, Search]) => {

		// Point the URL to a valid route service
		var routeTask = new RouteTask({
			url: "http://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World/solve?token=" + this.props.token
		});

		// The stops and route result will be stored in this layer
		var routeLayer = new GraphicsLayer();

		var map = new Map({
			basemap: "streets",
			layers: [routeLayer] // Add the route layer to the map
		});

		var view = new MapView({
			container: "viewDiv",
			map,
			zoom: this.state.zoom,
			center: [this.state.longitude, this.state.latitude]
		});

		// Setup the route parameters
		var routeParams = new RouteParameters({
			stops: new FeatureSet(),
			outSpatialReference: { // autocasts as new SpatialReference()
				wkid: 3857
			}
		});

		// Define the symbology used to display the stops
		var stopSymbol = {
			type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
			style: "cross",
			size: 15,
			outline: { // autocasts as new SimpleLineSymbol()
				width: 6
			}
		};

		// Define the symbology used to display the route
		var routeSymbol = {
			type: "simple-line", // autocasts as SimpleLineSymbol()
			color: [0, 0, 255, 0.5],
			width: 5
		};

    var search = new Search({
      view: view
    });
    
    // var locator = new Locator('https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer');

    view.ui.add(search, { position: "top-left", index: 2 });

    var puntos = null;

    search.on("search-complete", this.setArrayCoordinates);

    if (puntos !== null) {
      this.setArrayCoordinates(puntos);
    }

    search.on("select-result", function(event) {
      var address_name = { 'field_name': event.result.name };
      var api = 'http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Locators/ESRI_Geocode_USA/GeocodeServer/findAddressCandidates?Address=380+New+York+Street&City=Redlands&State=CA&Zip=92373';
      fetch(api, { mode: 'no-cors' }).then(response => console.log(response));
    });


		// Adds a graphic when the user clicks the map. If 2 or more points exist, route is solved.
    view.on("click", addStop);


		function addStop(event) {
			// Add a point at the location of the map click
			var stop = new Graphic({
				geometry: event.mapPoint,
				symbol: stopSymbol
			});
			routeLayer.add(stop);

			// Execute the route task if 2 or more stops are input
			routeParams.stops.features.push(stop);
			if (routeParams.stops.features.length >= 2) {
				routeTask.solve(routeParams).then(showRoute);
			}
		}

		console.log(routeLayer);

		// Adds the solved route to the map as a graphic
		function showRoute(data) {
			var routeResult = data.routeResults[0].route;
			routeResult.symbol = routeSymbol;
			routeLayer.add(routeResult);
			view.addLayers(routeLayer);
		}
	});
}

	render() {

		return (
			<div id="viewDiv">
			</div>
		);
	}
}

AppGeo.propTypes = {
	token: PropTypes.string,
};


export default AppGeo;

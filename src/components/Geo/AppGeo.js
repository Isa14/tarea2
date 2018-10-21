import React from "react";
import "./AppGeo.less";
import PropTypes from "prop-types";
import { loadModules } from 'esri-loader';

var map = null;
var steps = null;
var routeLayer = null;

const options = {
  url: 'https://js.arcgis.com/4.9/'
};

class AppGeo extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			zoom: 14,
			latitude: 38.889931,
      		longitude: -77.009003
	};
		this.updateRouteLayer = this.updateRouteLayer.bind(this);
		this.setArrayCoordinates = this.setArrayCoordinates.bind(this);
  }

  updateRouteLayer() {
	  loadModules([
		  "esri/Graphic",
		  "esri/layers/GraphicsLayer",
		  "esri/tasks/RouteTask",
		  "esri/tasks/support/RouteParameters",
		  "esri/tasks/support/FeatureSet"
	  ], options)
		  .then(([Graphic, GraphicsLayer, RouteTask, RouteParameters, FeatureSet]) => {
		// Point the URL to a valid route service
		var routeTask = new RouteTask({
			url: "http://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World/solve?token=" + this.props.token
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

		// Add a point at the location of the map click
		map.layers.removeAll();
		// The stops and route result will be stored in this layer
		routeLayer = new GraphicsLayer();
		map.layers.add(routeLayer);

		// Setup the route parameters
		var routeParams = new RouteParameters({
			stops: new FeatureSet(),
			outSpatialReference: { // autocasts as new SpatialReference()
				wkid: 3857
			}
		});

		steps.map(stop => addStop(stop));


		function addStop(substep) {
			var stop = new Graphic({
				geometry: substep.geometry,
				symbol: stopSymbol
			});
			routeLayer.add(stop);
			routeParams.stops.features.push(stop);
		}

		// Execute the route task if 2 or more stops are input
		if (routeParams.stops.features.length >= 2) {
			routeTask.solve(routeParams).then(showRoute);
		}

		// Adds the solved route to the map as a graphic
		function showRoute(data) {
			var routeResult = data.routeResults[0].route;
			routeResult.symbol = routeSymbol;
			routeLayer.add(routeResult);
		}
	});
  }

  setArrayCoordinates(event) {
		var address_name = event.result.name;
		var geometry = event.result.feature.geometry;
		var puntos = {
			address: address_name,
			geometry: geometry
		};
		this.props.setSteps(puntos);
	}

	componentDidUpdate() {
		steps = this.props.steps;
		this.updateRouteLayer();
	}

	componentDidMount() {
		loadModules([
			"esri/Map",
			"esri/views/MapView",
			"esri/layers/GraphicsLayer",
      		'esri/widgets/Search'
		], options)
		.then(([Map, MapView, GraphicsLayer, Search]) => {

		var routeLayer = new GraphicsLayer();

		map = new Map({
			basemap: "streets",
			layers: [routeLayer] // Add the route layer to the map
		});

		var view = new MapView({
			container: "viewDiv",
			map,
			zoom: this.state.zoom,
			center: [this.state.longitude, this.state.latitude]
		});

		var search = new Search({ view: view }, "search");
		search.on("select-result", this.setArrayCoordinates);
		// view.on("click", addStop);
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
	setSteps: PropTypes.func,
	steps: PropTypes.array
};


export default AppGeo;

import React from "react";
import "./AppGeo.less";
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
			longitude: -77.009003
		};
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
			"esri/core/urlUtils"
		], options)
		.then(([Map, MapView, Graphic, GraphicsLayer, RouteTask, RouteParameters, FeatureSet, urlUtils]) => {


		// Point the URL to a valid route service
		var routeTask = new RouteTask({
			url: "http://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World/solve?token=OyMRlw2dH6xDS2dOULhSWulgGqrUc8lzqZawpqjVyvFAWYMlllqbYbwwNsNV8oJD0_6nildLxAv0PinYwqYnkmivAp9Eoygw9uAYXNJmRuGb-qJrth9bFPRJHwkDpri3vu8wyxvjcAd9PMuHgfyn6g.."
		});

		// The stops and route result will be stored in this layer
		var routeLayer = new GraphicsLayer();

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

export default AppGeo;

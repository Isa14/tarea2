import React from "react";
import "./AppGeo.less";
import PropTypes from "prop-types";
import { loadModules } from 'esri-loader';
import geolocate from 'mock-geolocation';

var steps = null;
var routeLayer = null;
var routeResult = null;

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
		};

		this.updateRouteLayer = this.updateRouteLayer.bind(this);
		this.setArrayCoordinates = this.setArrayCoordinates.bind(this);
		this.startSimulation = this.startSimulation.bind(this);
		this.moveGeolocate = this.moveGeolocate.bind(this);
		this.toGeographic = this.toGeographic.bind(this);
	}

	startSimulation() {
		loadModules(["esri/widgets/Track"], options)
		.then(([Track]) => {

			this.currentCoordIndex = 0;
			this.startRoute = false;
			this.moveGeolocate();

			this.track = new Track({
				view: this.view,
				goToLocationEnabled: true
			});
			this.view.ui.add(this.track, "top-left");
		});
	};

	moveGeolocate () {
		var coords = routeResult.geometry.paths;
		geolocate.use();
		this.interval = setInterval(() => {
			if (this.currentCoordIndex == 1) {
				this.startRoute = true;
			}
			const stop = this.currentCoordIndex === 0 && this.startRoute;
			if (!stop) {
				var point = this.toGeographic(coords[0][this.currentCoordIndex][0], coords[0][this.currentCoordIndex][1]);
				geolocate.change({ lat: point[1], lng: point[0] });
				if (this.track.tracking) {
					this.currentCoordIndex = (this.currentCoordIndex + 1) % coords[0].length;
				}
			}
		}, 1500);
	}

	toGeographic(mercatorX_lon, mercatorY_lat) {
		var coord = [];
		if (Math.abs(mercatorX_lon) < 180 && Math.abs(mercatorY_lat) < 90) {
				coord.push(mercatorX_lon);
				coord.push(mercatorY_lat);
		} else {
			if (Math.abs(mercatorX_lon) > 20037508.3427892 || Math.abs(mercatorY_lat) > 20037508.3427892) {
				coord.push(mercatorX_lon);
				coord.push(mercatorY_lat);
			} else {
				var xMerc = mercatorX_lon;
				var yMerc = mercatorY_lat;
				var num3 = xMerc / 6378137.0;
				var num4 = num3 * 57.295779513082323;
				var num5 = Math.floor(num4 + 180.0 / 360.0);
				var num6 = num4 - num5 * 360.0;
				var num7 = 1.5707963267948966 - 2.0 * Math.atan(Math.exp(-1.0 * yMerc / 6378137.0));
				mercatorX_lon = num6;
				mercatorY_lat = num7 * 57.295779513082323;
				coord.push(mercatorX_lon);
				coord.push(mercatorY_lat);
			}
		}
		return coord;
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
			this.map.layers.removeAll();

			// The stops and route result will be stored in this layer
			routeLayer = new GraphicsLayer();

			this.map.layers.add(routeLayer);

			// Setup the route parameters
			this.routeParams = new RouteParameters({
				stops: new FeatureSet(),
				outSpatialReference: { // autocasts as new SpatialReference()
					wkid: 3857
				}
			});

			steps.map(stop => addStop(this.routeParams, stop));

			function addStop(routeParams, substep) {
				var stop = new Graphic({
					geometry: substep.geometry,
					symbol: stopSymbol
				});
				routeLayer.add(stop);
				routeParams.stops.features.push(stop);
			}

			// Execute the route task if 2 or more stops are input
			if (this.routeParams.stops.features.length >= 2) {
				routeTask.solve(this.routeParams).then(showRoute);
			}

			// Adds the solved route to the map as a graphic
			function showRoute(data) {
				routeResult = data.routeResults[0].route;
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
			'esri/widgets/Print',
			'esri/widgets/Search',
		], options)
		.then(([Map, MapView, GraphicsLayer, Print, Search]) => {

			// The stops and route result will be stored in this layer
			this.routeLayer = new GraphicsLayer();

			this.map = new Map({
				basemap: "streets",
				layers: [this.routeLayer] // Add the route layer to the map
			});

			this.view = new MapView({
				container: "viewDiv",
				map: this.map,
				zoom: this.state.zoom,
				center: [this.state.longitude, this.state.latitude]
			});

			this.print = new Print({
				view: this.view,
				printServiceUrl: "https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export Web Map Task"
			}, "imprimir");

			// Add widget to the top right corner of the view
			this.search = new Search({ view: this.view }, "buscar");
			this.search.on("select-result", this.setArrayCoordinates);
			this.search.on("select-result", this.addStop);

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

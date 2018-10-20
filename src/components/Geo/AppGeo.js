import React from "react";
import "./AppGeo.less";
import PropTypes from "prop-types";
import { loadModules } from 'esri-loader';

var steps = null;
var routeParams = null;

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
			buffer: []
    };
		this.setArrayCoordinates = this.setArrayCoordinates.bind(this);
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
			"esri/geometry/Point",
      		'esri/widgets/Search'
		], options)
		.then(([Map, MapView, Graphic, GraphicsLayer, RouteTask, RouteParameters, Point, FeatureSet, Search]) => {

		// Point the URL to a valid route service
		var routeTask = new RouteTask({
			url: "http://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World/solve?token=" + this.props.token
		});

		// The stops and route result will be stored in this layer
		var routeLayer = new GraphicsLayer();

		// Setup the route parameters
		routeParams = new RouteParameters({
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

		var search = new Search({ view: view }, "search");
		search.on("select-result", this.setArrayCoordinates);
		search.on("search-complete", alfajor);
		// si querés probar que se vea el punto sólo al buscar, reemplaza la funcion de arriba por addStop
		// view.on("click", addStop);

		function alfajor(evento) {
			console.log('hol');
		}

		function addStop(event) {
			// Add a point at the location of the map click
			var stop = new Graphic({
				geometry: event.result.feature.geometry,
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
	setSteps: PropTypes.func,
	steps: PropTypes.array
};


export default AppGeo;

import React from "react";
import "./AppGeo.less";
import PropTypes from "prop-types";
import { loadModules } from 'esri-loader';

var map = null;
var steps = null;

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
		this.showRoute = this.showRoute.bind(this);
		this.addStop = this.addStop.bind(this);
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
      		'esri/widgets/Search'
		], options)
		.then(([Map, MapView, Graphic, GraphicsLayer, RouteTask, RouteParameters, FeatureSet, Search]) => {

			// Point the URL to a valid route service
			this.routeTask = new RouteTask({
				url: "http://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World/solve?token=" + this.props.token
			});

			// The stops and route result will be stored in this layer
			this.routeLayer = new GraphicsLayer();

			// Setup the route parameters
			this.routeParams = new RouteParameters({
				stops: new FeatureSet(),
				outSpatialReference: { // autocasts as new SpatialReference()
					wkid: 3857
				}
			});

			// Define the symbology used to display the stops
			this.stopSymbol = {
				type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
				style: "cross",
				size: 15,
				outline: { // autocasts as new SimpleLineSymbol()
					width: 6
				}
			};

			// Define the symbology used to display the route
			this.routeSymbol = {
				type: "simple-line", // autocasts as SimpleLineSymbol()
				color: [0, 0, 255, 0.5],
				width: 5
			};

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

			this.search = new Search({ view: this.view }, "search");
			this.search.on("select-result", this.setArrayCoordinates);
			this.search.on("select-result", this.addStop);

			// si querés probar que se vea el punto sólo al buscar, reemplaza la funcion de arriba por addStop
			// view.on("click", addStop);
		});
	}

	addStop(event) {
		// Add a point at the location of the map click
		loadModules(["esri/Graphic"], options)
		.then(([Graphic]) => {
			var stop = new Graphic({
				geometry: event.result.feature.geometry,
				symbol: this.stopSymbol
			});
			this.routeLayer.add(stop);

			// Execute the route task if 2 or more stops are input
			this.routeParams.stops.features.push(stop);
			if (this.routeParams.stops.features.length >= 2) {
				this.routeTask.solve(this.routeParams).then(this.showRoute);
			}
		});
	}

	// Adds the solved route to the map as a graphic
	showRoute(data) {
		var routeResult = data.routeResults[0].route;
		routeResult.symbol = this.routeSymbol;
		this.routeLayer.add(routeResult);
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

	import React from "react";
	import "./AppGeo.less";
	import PropTypes from "prop-types";
	import { loadModules } from 'esri-loader';
	import geolocate from 'mock-geolocation';

	var steps = null;
	var routeLayer = null;
	var routeResult = null;
	var time = 5000;

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
				speedGlobal: 0
			};

			this.updateRouteLayer = this.updateRouteLayer.bind(this);
			this.setArrayCoordinates = this.setArrayCoordinates.bind(this);
			this.startSimulation = this.startSimulation.bind(this);
			this.moveGeolocate = this.moveGeolocate.bind(this);
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
			loadModules(["esri/geometry/support/webMercatorUtils", "esri/geometry/Point", "esri/widgets/Popup"], options)
			.then(([webMercatorUtils, Point, Popup]) => {
				var coords = routeResult.geometry.paths;
				geolocate.use();
				this.interval = setInterval(() => {
					if (this.currentCoordIndex == 1) {
						this.startRoute = true;
					}

					const stop = this.currentCoordIndex === 0 && this.startRoute;
					var popup = this.view.popup;
					if (!stop) {
						var speed = 0;
						var actualPoint = webMercatorUtils.xyToLngLat(coords[0][this.currentCoordIndex][0], coords[0][this.currentCoordIndex][1]);
						geolocate.change({ lat: actualPoint[1], lng: actualPoint[0] });

						if (this.currentCoordIndex > 0) {
							var nextPoint = webMercatorUtils.xyToLngLat(coords[0][this.currentCoordIndex - 1][0], coords[0][this.currentCoordIndex - 1][1]);
							var point1 = new Point(actualPoint[0], actualPoint[1], { wkid: 3857 });
							var point2 = new Point(nextPoint[0], nextPoint[1], { wkid: 3857 });
							speed = point1.distance(point2) * 100 * 10 * 60;
						}

						if (speed > 160) {
							let decimals = (Math.floor(Math.random() * 100) + 1) / 100;
							speed = 159 + decimals;
						}
						this.setState({
							speedGlobal: speed.toFixed(2)
						});
						var speedStyle = speed - 80;
						var tmSpeed = "translate(-50%, 0) rotate(" + speedStyle + 'deg)';

						document.getElementById("speed").style.transform = tmSpeed;

						popup.open({
							title: "Información de la simulación",
							location: "top-right",
							content: document.getElementById("id-speed")
						});

						// Watch currentDockPosition of the popup and open the
						// popup at the specified position.
						popup.watch("currentDockPosition", function(value) {
							popup.visible = true;
						});

						if (this.track.tracking) {
							this.currentCoordIndex = (this.currentCoordIndex + 1) % coords[0].length;
						}
					}
				}, time);
			});
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
					style: "circle",
					color: [255, 255, 255, 1],
					size: 10,
					outline: { // autocasts as new SimpleLineSymbol()
						width: 1,
						color: [0, 0, 255, 1]
					}
				};

				var lastSymbol = {
					type: "picture-marker", // autocasts as new PictureMarkerSymbol()
					url: "http://siniestro.xyz/pis/way.png",
					width: "32px",
					height: "32px",
					yoffset: "15px"
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

				steps.map((stop, index) => addStop(this.routeParams, stop, index > 0 && index === steps.length - 1));

				function addStop(routeParams, substep, last) {
					var stop = null;
					if (last) {
						stop = new Graphic({
							geometry: substep.geometry,
							symbol: lastSymbol
						});
					} else {
						stop = new Graphic({
							geometry: substep.geometry,
							symbol: stopSymbol
						});
					}
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
			if (steps !== this.props.steps) {
				steps = this.props.steps;
				this.updateRouteLayer();
			}
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
					<div id="id-speed" className="tm-speed">
						<p>Estado actual: </p>
						<p>Población en el buffer: </p>
						<p><strong>Velocidad actual:</strong> {this.state.speedGlobal} km/h </p>
						<div>
							<div id="speed"></div>
						</div>
					</div>
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

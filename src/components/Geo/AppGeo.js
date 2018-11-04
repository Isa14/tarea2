import React from "react";
import "./AppGeo.less";
import PropTypes from "prop-types";
import { loadModules } from 'esri-loader';
import geolocate from 'mock-geolocation';

var steps = null;
var routeLayer = null;
var routeResult = null;
var time = 10000;
var buffer = 1000;
var routeSimulation = null;

const options = {
	url: 'https://js.arcgis.com/4.9/'
};

class AppGeo extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			zoom: 4,
			latitude: 39.75999858400047,
			longitude: -98.49999638099968,
			speedGlobal: 0,
			totalPop: 0
		};

		this.updateRouteLayer = this.updateRouteLayer.bind(this);
		this.simulationLayer = this.simulationLayer.bind(this);
		this.setArrayCoordinates = this.setArrayCoordinates.bind(this);
		this.startSimulation = this.startSimulation.bind(this);
		this.moveGeolocate = this.moveGeolocate.bind(this);
		this.createPoygon = this.createPoygon.bind(this);
		this.loadCountiesLayer = this.loadCountiesLayer.bind(this);
		this.getTotalPopulation = this.getTotalPopulation.bind(this);
		this.intersectRings = this.intersectRings.bind(this);
		this.sumPopulation = this.sumPopulation.bind(this);
		this.getAreas = this.getAreas.bind(this);
		this.metresToMiles = this.metresToMiles.bind(this);
		this.showRoute = this.showRoute.bind(this);
	}

	metresToMiles(metres) {
		return metres * 0.000621371192;
	}

	loadCountiesLayer() {
		loadModules(["esri/layers/FeatureLayer"], options)
			.then(([FeatureLayer]) => {
				this.countiesFeatureLayer = new FeatureLayer({
					url: "http://services.arcgisonline.com/arcgis/rest/services/Demographics/USA_1990-2000_Population_Change/MapServer/3"
				});
			});
	};

	getTotalPopulation() {
		loadModules(["esri/tasks/support/Query"], options)
			.then(([Query]) => {
				this.map.layers.add(this.countiesFeatureLayer);
				var query = this.countiesFeatureLayer.createQuery();
				query.geometry = this.circleGeometry;
				query.spatialRelationship = 'intersects';
				query.returnGeometry = true;
				query.outFields = ["*"];

				this.countiesFeatureLayer.queryFeatures(query)
					.then(response => this.intersectRings(response));
			});
	};

	intersectRings(response) {
		loadModules(["esri/tasks/support/Query", "esri/request", "esri/symbols/SimpleFillSymbol", "esri/Graphic"], options)
			.then(([Query, esriRequest, SimpleFillSymbol, Graphic, GeometryService]) => {
				var countiesRings = [];
				var arrayLength = response.features.length;
				this.intersectedCounties = response.features;
				this.lala = [];
				for (var index = 0; index < arrayLength; index++) {
					// this.view.graphics.removeAll();
					// countiesRings.push({ rings: this.intersectedCounties[i].geometry.rings });
					countiesRings.push(this.intersectedCounties[index].geometry);
					var fillSymbol = new SimpleFillSymbol({
						color: [60, 179, 113, 0.3],
						outline: {
							color: [255, 255, 255],
							width: 1
						}
					});
					// Agregar el simbolo y la geometria a un grafico nuevo
					this.lala[index] = new Graphic({
						geometry: this.intersectedCounties[index].geometry,
						symbol: fillSymbol
					});
					// Agregar el grafico a la vista
					this.view.graphics.add(this.lala[index]);
				}

				var fillSymbolCircle = new SimpleFillSymbol({
					color: [227, 139, 79, 0.3],
					outline: {
						color: [255, 255, 255],
						width: 1
					}
				});
				// Agregar el simbolo y la geometria a un grafico nuevo
				this.polygonGraphic = new Graphic({
					geometry: this.circleGeometry,
					symbol: fillSymbolCircle
				});
				// Agregar el grafico a la vista
				this.view.graphics.add(this.polygonGraphic);

				var options_esri = {
					query: {
						f: 'json',
						geometries: JSON.stringify({ geometryType: "esriGeometryPolygon", geometries: countiesRings }),
						geometry: JSON.stringify({ geometryType: "esriGeometryPolygon", geometry: { rings: this.circleGeometry.rings } }),
						sr: 4326
					},
					responseType: 'json'
				};
				var url = 'http://tasks.arcgisonline.com/arcgis/rest/services/Geometry/GeometryServer/intersect';
				esriRequest(url, options_esri).then(response => this.getAreas(response));
			});
	}

	getAreas(response) {
		loadModules(["esri/request"], options)
			.then(([esriRequest]) => {
				var ringsForAreas = {
					query: {
						f: 'json',
						polygons: JSON.stringify(response.data.geometries),
						sr: 4326,
						calculationType: 'preserveShape'
					},
					responseType: 'json'
				};
				var url = 'http://tasks.arcgisonline.com/arcgis/rest/services/Geometry/GeometryServer/areasAndLengths';
				esriRequest(url, ringsForAreas).then(response => this.sumPopulation(response));
			});
	};

	sumPopulation(response) {
		var total = 0;
		var largoRings = response.data.areas.length;
		for (var i = 0; i < largoRings; i++) {
			var areaMiles = this.metresToMiles(response.data.areas[i]);
			var intersectedPOP = areaMiles * this.intersectedCounties[i].attributes.TOTPOP_CY / this.intersectedCounties[i].attributes.LANDAREA;
			total = total + Math.ceil(intersectedPOP);
		}

		this.setState({ totalPop: total });
	};

	createPoygon(lat, lng) {
		loadModules(["esri/geometry/Circle", "esri/geometry/Point", "esri/symbols/SimpleFillSymbol", "esri/Graphic"], options)
			.then(([Circle, Point, SimpleFillSymbol, Graphic]) => {
				var point = new Point([lng, lat]);
				this.circleGeometry = new Circle({
					center: point,
					geodesic: true,
					radius: buffer
				});
				this.getTotalPopulation();
			});
	}

	startSimulation() {
		loadModules(["esri/widgets/Track"], options)
			.then(([Track]) => {

				this.currentCoordIndex = 0;
				this.moveGeolocate();

				this.track = new Track({
					view: this.view,
					goToLocationEnabled: true
				});
				this.view.ui.add(this.track, "top-left");
			});
		};

		moveGeolocate() {
			loadModules([
				"esri/geometry/Point",
				"esri/Graphic"
			], options)
			.then(([Point, Graphic]) => {
				var coords = this.props.routeSimulation.paths;

				geolocate.use();
				this.interval = setInterval(() => {
					if (this.currentCoordIndex == 1) {
						this.startRoute = true;
					}
					const stop = this.currentCoordIndex === 0 && this.startRoute;
					if (!stop) {
						var actualPoint = coords[0][this.currentCoordIndex];
						if (this.track.tracking) {
							var speed = 0;
							this.view.graphics.remove(this.polygonGraphic);
							if (this.currentCoordIndex > 0) {
								this.createPoygon(actualPoint[1], actualPoint[0]);
								var nextPoint = coords[0][this.currentCoordIndex - 1];
								var point1 = new Point(actualPoint[0], actualPoint[1], { wkid: 4326 });
								var point2 = new Point(nextPoint[0], nextPoint[1], { wkid: 4326 });
								speed = point1.distance(point2) * 100 * 5 * 60;
							}
							var popup = this.view.popup;
							if (speed > 160) {
								let decimals = (Math.floor(Math.random() * 100) + 1) / 100;
								speed = 159 + decimals;
							}
							this.setState({ speedGlobal: speed.toFixed(2) });
							var speedStyle = speed - 80;
							var tmSpeed = "translate(-50%, 0) rotate(" + speedStyle + "deg)";

							var red = Math.trunc(255 - speed);
							var green = Math.trunc(speed);

							var typeSymbol = "simple-marker"; // asumo que acá se va a cambiar así que lo dejo por ahora así
							var stopSymbol = {
								type: typeSymbol, // autocasts as new SimpleMarkerSymbol()
								style: "circle",
								color: [red, green, 0, 1],
								size: 20,
								outline: { // autocasts as new SimpleLineSymbol()
									width: 1,
									color: [255, 255, 255, 1]
								}
							};
							this.view.graphics.removeAll();

							geolocate.change({ lat: actualPoint[1], lng: actualPoint[0] });
							this.track.graphic.symbol = stopSymbol;
							var location = this.track.graphic;

							this.view.goTo({
								scale: buffer * 50,
								center: location
							});
							this.view.graphics.add(new Graphic({ geometry: this.track.graphic.geometry, symbol: stopSymbol }));

							if (document.getElementById("speed")) {
								document.getElementById("speed").style.transform = tmSpeed;
							}
							popup.open({
								title: "Información de la simulación",
								content: document.getElementById("id-speed"),
								position: this.view.center
							});

							popup.watch("currentDockPosition", function (value) {
								popup.visible = true;
							});
							this.currentCoordIndex = (this.currentCoordIndex + 1) % coords[0].length;
						} else {
							geolocate.change({ lat: actualPoint[1], lng: actualPoint[0] });
							this.view.goTo({
								center: this.view.center
							});
							this.currentCoordIndex = this.currentCoordIndex;
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
					size: 15,
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
						wkid: 4326
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
					routeTask.solve(this.routeParams).then(data => this.showRoute(data, routeSymbol));
				}
			});
	}

	// Adds the solved route to the map as a graphic
	showRoute(data, routeSymbol) {
		routeResult = data.routeResults[0].route;
		routeResult.symbol = routeSymbol;
		routeLayer.add(routeResult);
		this.props.getRoute(data.routeResults[0].route);
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

	simulationLayer() {
		loadModules(["esri/Graphic", "esri/geometry/Point"], options)
			.then(([Graphic, Point]) => {

				// Define the symbology used to display the stops
				var firstSymbol = {
					type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
					style: "circle",
					color: [255, 255, 255, 1],
					size: 15,
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

				this.map.layers.removeAll();
				var routeSymbol = {
					type: "simple-line", // autocasts as SimpleLineSymbol()
					color: [0, 0, 255, 0.5],
					width: 5
				};

				var simulation = new Graphic({
					geometry: this.props.routeSimulation,
					symbol: routeSymbol
				});

				var first = this.props.routeSimulation.paths[0][0];
				var last = this.props.routeSimulation.paths[0][this.props.routeSimulation.paths[0].length - 1];
				var pointFirst = new Point(first[0], first[1], { wkid: 4326 });
				var pointLast = new Point(last[0], last[1], { wkid: 4326 });

				var stopFirst = new Graphic({
					geometry: pointFirst,
					symbol: firstSymbol
				});

				var stopLast = new Graphic({
					geometry: pointLast,
					symbol: lastSymbol
				});

				routeLayer.add(simulation);
				routeLayer.add(stopFirst);
				routeLayer.add(stopLast);

				this.map.layers.add(routeLayer);
			});
	}

	componentDidUpdate() {
		if (steps !== this.props.steps) {
			steps = this.props.steps;
			this.updateRouteLayer();
		}

		if (this.props.routeSimulation !== routeSimulation) {
			routeSimulation = this.props.routeSimulation;
			this.simulationLayer();
		}
		if (this.props.routeSimulation !== routeSimulation && this.props.routeSimulation !== null) {
			routeSimulation = this.props.routeSimulation;
			this.simulationLayer();
		}

		if (this.props.buffer && this.props.buffer !== buffer) {
			buffer = this.props.buffer;
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
					wkid: 4326,
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
				this.loadCountiesLayer();
			});
	}

	render() {
		return (
			<div id="viewDiv">
				<div id="id-speed" className="tm-speed">
					<p><strong>Estado actual:</strong> </p>
					<p><strong>Población en el buffer:</strong> {this.state.totalPop} </p>
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
	steps: PropTypes.array,
	buffer: PropTypes.string,
	getRoute: PropTypes.func,
	routeSimulation: PropTypes.object
};


export default AppGeo;

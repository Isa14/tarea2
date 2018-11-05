import React, { Component } from "react";
import "./components/Geo/AppGeo.less";
import AppGeo from "./components/Geo/AppGeo";
import Menu from "./components/Menu/Menu";
import { loadModules } from "esri-loader";

const options = {
  url: 'https://js.arcgis.com/4.9/'
};

class App extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    this.state = {
      token: process.env.REACT_APP_ESRI_TOKEN,
      steps: [],
      buffer: [],
      route: null,
      bufferSize: 0,
      routeSimulation: null,
      searching: true
    };
    // this.handleRequest = this.handleRequest.bind(this);
    this.setSteps = this.setSteps.bind(this);
    this.quitStep = this.quitStep.bind(this);
    this.saveSteps = this.saveSteps.bind(this);
    this.updateSteps = this.updateSteps.bind(this);
    this.deleteSteps = this.deleteSteps.bind(this);
    this.simulateRoute = this.simulateRoute.bind(this);
    this.getBufferSize = this.getBufferSize.bind(this);
    this.loadEventLayer = this.loadEventLayer.bind(this);
    this.getEventLayer = this.getEventLayer.bind(this);
    this.setEventLayer = this.setEventLayer.bind(this);
    this.updateEventSteps = this.updateEventSteps.bind(this);
    this.getRouteLayer = this.getRouteLayer.bind(this);
    this.setRouteLayer = this.setRouteLayer.bind(this);
    this.updateRoute = this.updateRoute.bind(this);
    this.getRoute = this.getRoute.bind(this);
    this.isSearching = this.isSearching.bind(this);
  }

  isSearching(searching) {
    this.setState({
      searching: searching
    });
  }

  loadEventLayer() {
    loadModules(["esri/layers/FeatureLayer"], options).then(
      ([FeatureLayer]) => {
        this.eventsFeatureLayer = new FeatureLayer(
          "http://sampleserver5.arcgisonline.com/arcgis/rest/services/LocalGovernment/Events/FeatureServer/0"
        );

        this.trailsFeatureLayer = new FeatureLayer(
          "http://sampleserver5.arcgisonline.com/ArcGIS/rest/services/LocalGovernment/Recreation/FeatureServer/1"
        );
      }
    );
  }

  getEventLayer() {
    loadModules(["esri/tasks/support/Query"], options).then(([Query]) => {
      var query = this.eventsFeatureLayer.createQuery();
      query.where = "eventid=20180514";
      query.outFields = ["*"];

      this.eventsFeatureLayer
        .queryFeatures(query)
        .then(response => this.setEventLayer(response.features));
    });
  }

  getRouteLayer() {
    loadModules(["esri/tasks/support/Query"], options).then(([Query]) => {
      var query = this.trailsFeatureLayer.createQuery();
      query.where = "trailtype=20180514";
      query.outFields = ["*"];

      this.trailsFeatureLayer
        .queryFeatures(query)
        .then(response => this.setRouteLayer(response.features));
    });
  }

  setRouteLayer(features) {
    var buffer = [];
    for (let index = 0; index < features.length; index++) {
      var step = {
        route: features[index].geometry,
        name: features[index].attributes.notes
      };
      buffer.push(step);
    }
    this.setState({
      buffer: buffer
    });
  }

  setEventLayer(features) {
    var steps = [];
    for (let index = 0; index < features.length; index++) {
      var step = {
        geometry: features[index].geometry,
        address: features[index].attributes.description
      };
      steps.push(step);
    }
    this.setState({
      steps: steps
    });
  }

  getBufferSize(size) {
    this.setState({
      bufferSize: size
    });
  }

  updateEventSteps() {
    loadModules(["esri/request"], options).then(([esriRequest]) => {
      var urlDelete =
        "http://sampleserver5.arcgisonline.com/arcgis/rest/services/LocalGovernment/Events/FeatureServer/0/deleteFeatures";
      esriRequest(urlDelete, {
        body: { f: "json", where: "eventid=20180514", sr: 4326 },
        method: "POST"
      });
      var geometries = [];
      for (var index = 0; index < this.state.steps.length; index++) {
        geometries[index] = {
          geometry: this.state.steps[index].geometry,
          attributes: {
            eventid: 20180514,
            description: this.state.steps[index].address
          }
        };
      }

      var payloadGeometries = JSON.stringify(geometries);
      var urlGeometry =
        "http://sampleserver5.arcgisonline.com/ArcGIS/rest/services/LocalGovernment/Events/FeatureServer/0/addFeatures";
      esriRequest(urlGeometry, {
        body: { f: "json", features: payloadGeometries, sr: 4326 },
        method: "POST"
      }).then(this.getEventLayer());
    });
  }

  updateRoute(name) {
    loadModules(["esri/request"], options).then(([esriRequest]) => {
      var features = [];
      features.push(this.state.route);
      features[0]["attributes"] = {
        notes: name,
        trailtype: 20180514
      };

      var payload = JSON.stringify(features);
      console.log(payload);
      var url =
        "http://sampleserver5.arcgisonline.com/ArcGIS/rest/services/LocalGovernment/Recreation/FeatureServer/1/addFeatures";
      esriRequest(url, {
        body: { f: "json", features: payload },
        method: "POST"
      }).then(this.getRouteLayer());
    });
  }

  updateSteps(steps) {
    this.setState({
      steps: steps
    });
    this.updateEventSteps();
  }

  getRoute(route) {
    this.setState({
      route: route
    });
  }

  saveSteps(name) {
    this.setState({
      steps: []
    });

    this.updateRoute(name);
    this.updateEventSteps();
    this.getEventLayer();
    this.getRouteLayer();
  }

  simulateRoute(index) {
    let route = this.state.buffer[index].route;
    this.setState({
      routeSimulation: route
    });

    if (document.getElementsByClassName("esri-track").length > 0) {
      document
        .getElementsByClassName("esri-track")[0]
        .parentNode.removeChild(
          document.getElementsByClassName("esri-track")[0]
        );
    }
    this.child.current.startSimulation();
  }

  deleteSteps() {
    this.setState({
      steps: []
    });
  }

  quitStep(step) {
    let newList = this.state.steps.filter((sub, index) => index !== step);
    this.setState({ steps: newList });
    this.updateEventSteps();
  }

  setSteps(step) {
    this.setState({
      steps: this.state.steps.concat(step)
    });
    this.updateEventSteps();
  }

  componentDidMount() {
    this.loadEventLayer();
    this.getEventLayer();
    this.getRouteLayer();
  }

  render() {
    let pageSearching = ["tm-page uk-flex uk-flex-center", this.state.searching ? "" : "tm-no-searching"];
    return (
      <div id="id-page" className={pageSearching.join(" ").trim()}>
        <Menu
          steps={this.state.steps}
          quitStep={this.quitStep}
          saveSteps={this.saveSteps}
          updateSteps={this.updateSteps}
          deleteSteps={this.deleteSteps}
          routes={this.state.buffer}
          simulateRoute={this.simulateRoute}
          getBufferSize={this.getBufferSize}
          isSearching={this.isSearching}
        />
        {this.state.token ?
          <AppGeo
            ref={this.child}
            token={this.state.token}
            setSteps={this.setSteps}
            steps={this.state.steps}
            buffer={this.state.bufferSize}
            getRoute={this.getRoute}
            routeSimulation={this.state.routeSimulation}
          />
        :
          <div />
        }
      </div>
    );
  }
}

export default App;

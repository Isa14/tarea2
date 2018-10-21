import React, { Component } from "react";
import "./components/Geo/AppGeo.less";
import AppGeo from "./components/Geo/AppGeo";
import Menu from "./components/Menu/Menu";

var globalToken = null;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: null,
      steps: [],
      buffer: []
    };
    this.handleRequest = this.handleRequest.bind(this);
    this.setSteps = this.setSteps.bind(this);
    this.quitStep = this.quitStep.bind(this);
    this.saveSteps = this.saveSteps.bind(this);
    this.deleteSteps = this.deleteSteps.bind(this);
  }

  saveSteps() {
    let list = this.state.steps;
    this.setState({
      steps: [],
      buffer: this.state.buffer.concat(list)
    });
    console.log(list);
  }

  deleteSteps() {
    this.setState({
      steps: [],
    });
  }

  quitStep(step) {
    let newList = this.state.steps.filter((sub, index) => index !== step);
    this.setState({ steps: newList });
  }

  setSteps(step) {
    this.setState({
      steps: this.state.steps.concat(step)
    });
  }

  handleRequest() {
    var request = require("request");

    var optionsToken = {
      method: "POST",
      url: "https://www.arcgis.com/sharing/rest/oauth2/token",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      form: {
        client_id: "F9j64PI4WsXspRH4",
        client_secret: "41bdc7914bc942ec818d5ee9bdb33793",
        grant_type: "client_credentials"
      }
    };

    request(optionsToken, function(error, response, body) {
      if (error) {
        throw new Error(error);
      }
      globalToken = JSON.parse(body).access_token;
    });

    setTimeout(
      function() {
        this.setState({ token: globalToken });
      }.bind(this),
      500
    );
  }

  componentDidMount() {
    this.handleRequest();
  }

  render() {
    return (
      <div id="id-page" className="tm-page uk-flex uk-flex-center">
        <Menu
          steps={this.state.steps}
          quitStep={this.quitStep}
          saveSteps={this.saveSteps}
          deleteSteps={this.deleteSteps}
          />
        {this.state.token ?
          <AppGeo
            token={this.state.token}
            setSteps={this.setSteps}
            steps={this.state.steps}
          />
        :
          <div />
        }
      </div>
    );
  }
}

export default App;

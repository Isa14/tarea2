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
      steps: []
    };
    this.handleRequest = this.handleRequest.bind(this);
    this.setSteps = this.setSteps.bind(this);
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
        <Menu />
        {this.state.token ? <AppGeo token={this.state.token} setSteps={this.setSteps} steps={this.state.steps} /> : <div />}
      </div>
    );
  }
}

export default App;

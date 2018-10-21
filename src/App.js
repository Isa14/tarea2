import React, { Component } from "react";
import "./components/Geo/AppGeo.less";
import AppGeo from "./components/Geo/AppGeo";
import Menu from "./components/Menu/Menu";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: process.env.REACT_APP_ESRI_TOKEN,
      steps: [],
      buffer: []
    };
    // this.handleRequest = this.handleRequest.bind(this);
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

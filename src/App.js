import React, { Component } from "react";
import "./components/Geo/AppGeo.less";
import AppGeo from "./components/Geo/AppGeo";
import Menu from "./components/Menu/Menu";

class App extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    this.state = {
      token: process.env.REACT_APP_ESRI_TOKEN,
      steps: [],
      buffer: [],
      route: null
    };
    // this.handleRequest = this.handleRequest.bind(this);
    this.setSteps = this.setSteps.bind(this);
    this.quitStep = this.quitStep.bind(this);
    this.saveSteps = this.saveSteps.bind(this);
    this.updateSteps = this.updateSteps.bind(this);
    this.deleteSteps = this.deleteSteps.bind(this);
    this.simulateRoute = this.simulateRoute.bind(this);
  }

  updateSteps(steps) {
    this.setState({
      steps: steps
    });
  }

  saveSteps(name) {
    let list = {
      name: name,
      route: this.state.steps
    };
    this.setState({
      steps: [],
      buffer: this.state.buffer.concat(list)
    });
  }

  simulateRoute(index) {
		let route = this.state.buffer[index].route;
		this.setState({
			steps: route
    });

    if (document.getElementsByClassName("esri-track").length > 0) {
      document.getElementsByClassName("esri-track")[0].parentNode.removeChild(document.getElementsByClassName("esri-track")[0]);
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
          updateSteps={this.updateSteps}
          deleteSteps={this.deleteSteps}
					routes={this.state.buffer}
					simulateRoute={this.simulateRoute}
        />
        {this.state.token ?
          <AppGeo
            ref={this.child}
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

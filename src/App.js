import React, { Component } from "react";
import "./components/Geo/AppGeo.less";
import AppGeo from "./components/Geo/AppGeo";
import Menu from "./components/Menu/Menu";

var coords = [
	{
	  lat: 34.05648363780692,
	  lng: -117.19565501782613
	},
	{
	  lng: -117.19565880345007,
	  lat: 34.05682230352545
	},
	{
	  lng: -117.19566258907402,
	  lat: 34.05716096924398
	},
	{
	  lng: -117.19566637469796,
	  lat: 34.05749963496251
	},
	{
	  lng: -117.19567016032191,
	  lat: 34.05783830068104
	},
	{
	  lng: -117.19567394594586,
	  lat: 34.05817696639957
	},
	{
	  lng: -117.1956777315698,
	  lat: 34.0585156321181
	},
	{
	  lng: -117.19568151719375,
	  lat: 34.05885429783663
	},
	{
	  lng: -117.1956853028177,
	  lat: 34.05919296355516
	},
	{
	  lat: 34.059192963555134,
	  lng: -117.19568530281771
	},
	{
	  lat: 34.05920092649827,
	  lng: -117.19575894615099
	},
	{
	  lng: -117.19575574232981,
	  lat: 34.058861053180614
	},
	{
	  lng: -117.19575253850863,
	  lat: 34.05852117986296
	},
	{
	  lng: -117.19574933468745,
	  lat: 34.0581813065453
	},
	{
	  lng: -117.19574613086627,
	  lat: 34.057841433227644
	},
	{
	  lng: -117.19574292704509,
	  lat: 34.05750155990999
	},
	{
	  lng: -117.19573972322391,
	  lat: 34.05716168659233
	},
	{
	  lng: -117.19573651940273,
	  lat: 34.056821813274674
	},
	{
	  lng: -117.19573331558155,
	  lat: 34.05648193995702
	},
	{
	  lat: 34.05648193995701,
	  lng: -117.19573331558153
	},
	{
	  lng: -117.19569416670383,
	  lat: 34.056482788881965
	},
	{
	  lng: -117.19565501782613,
	  lat: 34.05648363780692
	}
];

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
		this.child.current.startSimulation(coords);
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
					updateSteps={this.updateSteps}
					deleteSteps={this.deleteSteps}
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

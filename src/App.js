import React, { Component } from "react";
import "./components/Geo/AppGeo.less";
import AppGeo from "./components/Geo/AppGeo";

class App extends Component {
  render() {
    return (
      <div id="id-page" className="tm-page uk-flex uk-flex-center">
        <AppGeo />
      </div>
    );
  }
}

export default App;

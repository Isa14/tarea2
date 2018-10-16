import React from "react";
import "./AppGeo.less";
import { loadModules } from 'esri-loader';

const options = {
  url: 'https://js.arcgis.com/4.9/'
};

class AppGeo extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
      zoom: 4,
      latitude: 38.889931,
      longitude: -77.009003
		};
	}

	componentDidMount() {
    loadModules(['esri/Map', 'esri/views/MapView'], options)
    .then(([Map, MapView]) => {
      const map = new Map({ basemap: "streets" });
      const view = new MapView({
        container: "viewDiv",
        map,
        zoom: this.state.zoom,
        center: [this.state.longitude, this.state.latitude]
      });
    })
	}

	render() {

		return (
			<div id="viewDiv">
				<div className="tm-speed"></div>        
			</div>
		);
	}
}

export default AppGeo;

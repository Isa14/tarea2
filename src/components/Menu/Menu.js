import React from "react";
import "./Menu.less";
import PropTypes from "prop-types";

class Menu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isMenuOpened: false
        };
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        const { isMenuOpened } = this.state;
        this.setState({ isMenuOpened: !isMenuOpened });
    }

    render() {
        let classOffcanvas = [
            "tm-offcanvas",
            this.state.isMenuOpened ? "tm-offcanvas-expand" : "tm-offcanvas-not-expanded"
        ];

        let classCloseOffcanvas = [
            "tm-close-offcanvas",
            this.state.isMenuOpened ? "" : "uk-hidden"
        ];

        return <div className="tm-offcanvas-bar">
            <div className="tm-burger">
              <a className="tm-link-burger" onClick={this.handleClick}>
                <img className="tm-svg" src="menu.svg" alt="menu" />
              </a>
            </div>
            <div className={classOffcanvas.join(" ").trim()}>
              <div className={classCloseOffcanvas.join(" ").trim()}>
                <a onClick={this.handleClick}>x</a>
              </div>

              <div className="tm-content">
                <div>
                  <div id="search" />
                </div>
                <div className="tm-ruta">
                    <h2>Paradas de la ruta actual</h2>
                    <ul className="tm-list">
                    {
                        this.props.steps.length > 0
                        ?
                        this.props.steps.map((step, index) => <li key={index}>{step.address}</li>)
                        : <p>Aún no ha seleccionado ninguna parada para su ruta.</p>
                    }
                    </ul>
                </div>
              </div>
            </div>
          </div>;
    }
}

Menu.propTypes = {
    steps: PropTypes.array
};


export default Menu;

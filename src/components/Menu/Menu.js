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

        return (
            <div className="tm-offcanvas-bar">
                <div className="tm-burger">
                    <a class="tm-link-burger" onClick={this.handleClick} >
                        <img className="tm-svg" src="menu.svg" alt="menu"/>
                    </a>
                </div>
                <div className={classOffcanvas.join(" ").trim()}>
                    <div className={classCloseOffcanvas.join(" ").trim()}>
                        <a onClick={this.handleClick} >x</a>
                    </div>

                    <div class="tm-content">
                        <div id="search"></div>
                    </div>

                </div>
            </div>
        );
    }
}

Menu.propTypes = {
    token: PropTypes.string,
    setSteps: PropTypes.func,
    steps: PropTypes.array
};


export default Menu;

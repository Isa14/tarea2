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
    this.handleSave = this.handleSave.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  handleQuitStep(key) {
    this.props.quitStep(key);
  }

  handleCancel() {
      this.props.deleteSteps();
  }

  handleSave() {
      this.props.saveSteps();
  }

  handleClick() {
    const { isMenuOpened } = this.state;
    this.setState({ isMenuOpened: !isMenuOpened });
  }

  render() {
    let classOffcanvas = [
      "tm-offcanvas uk-flex",
      this.state.isMenuOpened
        ? "tm-offcanvas-expand"
        : "tm-offcanvas-not-expanded"
    ];

    let classCloseOffcanvas = [
      "tm-close-offcanvas",
      this.state.isMenuOpened ? "" : "uk-hidden"
    ];

    return (
      <div className="tm-offcanvas-bar">
        <div className={classOffcanvas.join(" ").trim()}>
          <div className="tm-burger">
            <a className="tm-link-burger" onClick={this.handleClick}>
              <img className="tm-svg" src="menu.svg" alt="menu" />
            </a>
          </div>

          <div className="tm-content">
            <div>
              <div id="search" />
            </div>
            <div className="tm-ruta">
              <h2>Paradas de la ruta actual</h2>
              <ul className="tm-list">
                {this.props.steps.length > 0 ?
                  this.props.steps.map((step, index) =>
                    <li draggable key={index}>
                      {step.address}
                      <a onMouseDown={this.handleQuitStep.bind(this, index)}>
                        x
                      </a>
                    </li>
                  )
                :
                  <p>Aún no ha seleccionado ninguna parada para su ruta.</p>
                }
              </ul>
              {this.props.steps.length > 0 ?
                <div className="uk-flex uk-flex-center uk-flex-between">
                  <a onMouseDown={this.handleSave} className="uk-button tm-button-guardar">Guardar</a>
                  <a onMouseDown={this.handleCancel} className="uk-button tm-button-cancelar">Cancelar</a>
                </div>
              :
                <div />
              }
            </div>
          </div>
          <div className={classCloseOffcanvas.join(" ").trim()}>
            <a onClick={this.handleClick}><img src="cancel.svg" className="tm-svg" alt="svg" /></a>
            <a><img src="lupa.svg" className="tm-svg" alt="svg" /></a>
            <a><img src="way.svg" className="tm-svg" alt="svg" /></a>
          </div>
        </div>
      </div>
    );
  }
}

Menu.propTypes = {
    steps: PropTypes.array,
    quitStep: PropTypes.func,
    deleteSteps: PropTypes.func,
    saveSteps: PropTypes.func
};


export default Menu;

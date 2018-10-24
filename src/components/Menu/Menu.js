import React from "react";
import "./Menu.less";
import PropTypes from "prop-types";

var placeholder = document.createElement("li");
placeholder.className = "placeholder";

class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isMenuOpened: false,
      name: ""
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  dragStart(event) {
    this.dragged = event.currentTarget;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/html", this.dragged);
  }

  dragEnd(event) {
    this.dragged.style.display = "block";

    if (document.getElementsByClassName("placeholder")) {
      this.dragged.parentNode.removeChild(placeholder);
    }

    var data = this.props.steps;
    var from = Number(this.dragged.dataset.id);
    var to = Number(this.over.dataset.id);
    if (from < to) {
      to--;
    }
    data.splice(to, 0, data.splice(from, 1)[0]);
    this.props.updateSteps(data);
  }

  dragOver(event) {
    event.preventDefault();
    this.dragged.style.display = "none";
    if (event.target.className === "placeholder") {
      return;
    }
    event.target.parentNode.insertBefore(placeholder, event.target);
    this.over = event.target;
  }

  handleQuitStep(key) {
    this.props.quitStep(key);
  }

  handleCancel() {
    this.props.deleteSteps();
  }

  handleSave() {
    this.props.saveSteps(this.state.name);
  }

  handleClick() {
    const { isMenuOpened } = this.state;
    this.setState({ isMenuOpened: !isMenuOpened });
  }

  handleChange(event) {
    this.setState({ name: event.target.value });
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
            <a className="tm-link-burger uk-flex" onClick={this.handleClick}>
              <img className="tm-svg" src="menu.svg" alt="menu" />
            </a>
          </div>

          <div className="tm-content">
            <div>
              <div id="search" />
            </div>
            <div className="tm-ruta">
              <h2>Paradas de la ruta actual</h2>
              <ul onDragOver={this.dragOver.bind(this)} className="tm-list">
                {this.props.steps.length > 0 ?
                  this.props.steps.map((step, index) =>
                    <li
                      draggable
                      data-id={index}
                      key={index}
                      onDragEnd={this.dragEnd.bind(this)}
                      onDragStart={this.dragStart.bind(this)}
                    >
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
                <div>
                  <div className="tm-form">
                    <form>
                      <input
                        required
                        type="text"
                        name="name"
                        placeholder="Nombre de la ruta*"
                        onChange={this.handleChange}
                      />
                    </form>
                  </div>
                  <div className="uk-flex uk-flex-center uk-flex-between">
                    <a
                      onMouseDown={this.handleSave}
                      className="uk-button tm-button-guardar"
                    >
                      Guardar
                    </a>
                    <a
                      onMouseDown={this.handleCancel}
                      className="uk-button tm-button-cancelar"
                    >
                      Cancelar
                    </a>
                  </div>
                </div>
              :
                <div />
              }
            </div>
          </div>
          <div className={classCloseOffcanvas.join(" ").trim()}>
            <a onClick={this.handleClick}>
              <img src="cancel.svg" className="tm-svg" alt="svg" />
            </a>
            <a>
              <img src="lupa.svg" className="tm-svg" alt="svg" />
            </a>
            <a>
              <img src="way.svg" className="tm-svg" alt="svg" />
            </a>
            <a>
              <img src="pdf.svg" className="tm-svg" alt="svg" />
            </a>
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
    saveSteps: PropTypes.func,
    updateSteps: PropTypes.func
};


export default Menu;

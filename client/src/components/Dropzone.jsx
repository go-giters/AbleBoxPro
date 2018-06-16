import React from 'react';
import { Row, Col } from 'reactstrap';
import css from './../styles/Dropzone.css';

class Dropzone extends React.Component {
  constructor(props) {
    super(props);

    this.dragOverHandler = this.dragOverHandler.bind(this);
    this.dragEnterHandler = this.dragEnterHandler.bind(this);
    this.dragLeaveHandler = this.dragLeaveHandler.bind(this);
    this.dropHandler = this.dropHandler.bind(this);

    this.state = {
      dragCounter: 0,
      dropzoneClass: props.children ? [] : ['empty']
    };
  }

  static getDerivedStateFromProps(props) {
    return {
      dropzoneClass: props.children ? [] : ['empty']
    };
  }

  dragOverHandler(e) {
    e.preventDefault();
  }

  dragEnterHandler(e) {
    this.setState(prevState => {
      const newState = {
        dragCounter: prevState.dragCounter + 1
      };

      if (newState.dragCounter === 1) {
        newState.dropzoneClass = [...prevState.dropzoneClass].concat(['hover']);
      }

      return newState;
    });
  }

  dragLeaveHandler(e) {
    this.setState(prevState => {
      const newState = {
        dragCounter: prevState.dragCounter - 1
      };

      if (!newState.dragCounter) {
        if (!this.props.children) {
          newState.dropzoneClass = ['empty'];
        } else {
          newState.dropzoneClass = [];
        }
      }

      return newState;
    });
  }

  dropHandler(e) {
    e.preventDefault();

    console.log('event in dropHandler: ', e)

    const data = e.dataTransfer;
    console.log('data in dropHandler: ', data)
    const items = data.items ? [...data.items] : [...data.files];
    const files = [];
    items.forEach(item => {
      if (item.kind === 'file') {
        files.push(item.getAsFile());
      }
    });

    this.setState(prevState => {
      const newState = {
        dragCounter: 0
      };

      if (!files.length && !this.props.children) {
        newState.dropzoneClass = ['empty'];
      } else {
        newState.dropzoneClass = [];
      }

      return newState;
    });

    data.items ? data.items.clear() : data.clearData();

    // this.props.handleFiles(files);

  }

  render () {
    return (
      <Row>
        <Col xs="12">
          <div
            id="dropzone"
            className={this.state.dropzoneClass.join(' ')}
            onDragOver={this.dragOverHandler}
            onDragEnter={this.dragEnterHandler}
            onDragLeave={this.dragLeaveHandler}
            onDrop={this.dropHandler}
          >
            {this.props.children
              ? this.props.children
              : this.props.searchMode
              ? <div></div>
              : <div className="dz-text">Drop files here to begin upload.</div>
            }
          </div>
        </Col>
      </Row>
    )
  }
}

export default Dropzone;

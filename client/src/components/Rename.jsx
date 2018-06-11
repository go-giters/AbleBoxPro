import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input } from 'reactstrap';
import editIcon from 'Src/assets/edit.png';
import css from 'Src/styles/Rename.css';
import $ from 'jquery';

class Rename extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      name: this.props.file.name,
      id: this.props.file.id,
      file: this.props.file
    };

    this.toggle = this.toggle.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleRename = this.handleRename.bind(this);
  }

  toggle() {
    this.setState({
      modal: !this.state.modal
    });
  }

  handleNameChange(e) {
    this.setState({
      name: e.target.value
    });
  }

  handleRename(name, id) {
    // console.log('e.target.value', e.target.value);
    console.log('handleRename');
    let targetItem = {
      name: name,
      id: id
    };

    $.ajax({
      type: 'PUT',
      url: '/updateName',
      data: JSON.stringify(targetItem),
      contentType: 'application/json; charset=utf-8',
      success: (data, textStatus, jqXHR) => {
        this.toggle();
        this.props.getFiles();
        this.setState ({
          file: this.props.file
        });
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        alert('handlerename error: ' + errorThrown);
      },
    });
  }

  render() {
    return (
      <div>
        <img className="edit-name" width="24px" className="edit-name" background="transparent" src={editIcon} alt="edit name" onClick={this.toggle}/>
        <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
          <ModalHeader toggle={this.toggle}>Edit Name</ModalHeader>
          <ModalBody>
            <Input value={this.state.name} onChange={this.handleNameChange}/>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={(e) => {this.handleRename(this.state.name, this.props.file.id);}}>Save</Button>{' '}
            <Button color="secondary" onClick={this.toggle}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default Rename;

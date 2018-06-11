import React from 'react';
import FileListEntry from 'Src/components/FileListEntry.jsx';
import Dropzone from 'Src/components/Dropzone.jsx';
import Path from 'Src/components/Path.jsx';
import { withRouter } from 'react-router-dom';
import { Row, Col, Input, Button, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';
import css from 'Src/styles/AllFiles.css';
import Search from 'Src/components/Search.jsx';
import $ from "jquery";
import createFolderIcon from 'Src/assets/createFolder.png';
import { debounce } from 'lodash';
import ipfsAPI from 'ipfs-api';


class AllFiles extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      files: null,
      searchMode: false,
      folderName: '',
      path: []
    };

    this.ipfsApi = ipfsAPI('localhost', '5001')

    this.handleClick = this.handleClick.bind(this);
    this.handleFiles = this.handleFiles.bind(this);
    this.searchHandler = this.searchHandler.bind(this);
    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.createFolder = this.createFolder.bind(this);
    this.searchHandler = debounce(this.searchHandler.bind(this), 500);
    this.handleClickDelete = this.handleClickDelete.bind(this);
    this.toggle = this.toggle.bind(this);
    this.saveToIpfs = this.saveToIpfs.bind(this);
  }

  componentDidMount() {
    this.getFiles();
  }

  getFiles() {
    $.ajax ({
      type: 'GET',
      url: '/getfiles',
      contentType: 'application/json; charset=utf-8',
      success: (data, textStatus, jqXHR) => {
        console.log(JSON.parse(data))
        this.setState({
          files: JSON.parse(data).result,
          path: JSON.parse(data).path
        })
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        alert(errorThrown); // need to decide on what we are doing here with the error
      },
    });
  }

  handleClick() {
    document.querySelector('#upload').click();
  }

  handleFiles(files) {
    let reader = new window.FileReader()
    reader.readAsArrayBuffer(files[0])
    reader.onloadend = () => {
      this.saveToIpfs(reader, files);
    }
  }

  saveToIpfs(reader, files) {
    let ipfsId
    const buffer = Buffer.from(reader.result)
    this.ipfsApi.add(buffer, { progress: (prog) => console.log(`received: ${prog}`) })
    .then((response) => {
      ipfsId = response[0].hash
      var fileLocation = 'https://ipfs.io/ipfs/' + ipfsId
      files.forEach(file => {
        file.upload = true;
        file.hash = ipfsId
        console.log('file: ', file)
      });
      this.setState({
        files: [...this.state.files].concat(files),
      });
    }).catch((err) => {
      console.error(err)
    })
  }

  searchHandler(value) {
    if (!value.length) {
      this.getFiles();
    } else {
      let data = {'keyword': value};
      $.ajax({
        type: 'POST',
        url: '/searchfiles',
        data: JSON.stringify(data),
        contentType: 'application/json; charset=utf-8',
        success: (data, textStatus, jqXHR) => {
          this.setState({
            files: JSON.parse(data),
            searchMode: true
          });
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
          alert('search handler error: ' + errorThrown);
        }
      });
    }
  }

  createFolder() {
    const data = {
      folderName: this.state.folderName,
    };
    $.ajax ({
      type: 'POST',
      url: '/createFolder',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(data),
      success: (data, textStatus, jqXHR) => {
        this.toggle();
        this.getFiles();
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        this.toggleError();
      },
    });
  }

  handleTitleChange(e) {
    e.preventDefault();
    this.setState({
      folderName: e.target.value
    });
  }

  handleKeyPress(e, cb) {
    if(e.charCode === 13 && e.target.value.length) {
      cb();
    }
  }

  handleClickDelete(fileId, is_folder) {
    let targetFile = {
      id: fileId,
      is_folder: is_folder
    };

    $.ajax({
      type: 'POST',
      url: '/delete',
      data: JSON.stringify(targetFile),
      contentType: 'application/json; charset=utf-8',
      success: (data, textStatus, jqXHR) => {
        this.setState({
          files: JSON.parse(data)
        })
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        alert('handleClickDelete error: ' + errorThrown);
      },
    });
  }

  getPath(fileId) {
    $.ajax({
      method: 'GET',
      url: '/path',
      data: this.props.file.id,
      dataType: 'json',
      success: (data) => {
        console.log(data)
      }
    })
  }

  toggle() {
    this.setState({
      modal: !this.state.modal,
    });
  }

  render () {
    if (!this.state.files) {
      return null;
    }

    return (
      <React.Fragment>
        <Row className="mt-3 no-gutters">
          <Col xs="10" sm="10" md="9" lg="8" className="mr-auto">
           <Search searchHandler={this.searchHandler} handleKeyPress ={this.handleKeyPress} />
          </Col>
          <Col xs="auto">
            <img className="create-folder" background="transparent" src={createFolderIcon} alt="create folder" onClick={this.toggle}/>
            <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
              <ModalHeader toggle={this.toggle}>Folder Name</ModalHeader>
              <ModalBody>
                <Input onChange={this.handleTitleChange} onKeyPress={(e)=>{this.handleKeyPress(e, this.createFolder)}}/>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" disabled={!this.state.folderName.length} onClick={this.createFolder}>Create Folder</Button>
                <Button color="secondary" onClick={this.toggle}>Cancel</Button>
              </ModalFooter>
            </Modal>
          </Col>
        </Row>
        <Path path = {this.state.path}/>
        <Dropzone files={this.state.files} handleFiles={this.handleFiles} searchMode={this.state.searchMode}>
          {this.state.files.length
            ? this.state.files.map((file, i) => <FileListEntry key={file.id} file={file} handleClickDelete={this.handleClickDelete}/>)
            : null
          }
        </Dropzone>
        <Row className="mt-3">
          <Col xs="12">
            <input type="file" id="upload" multiple onChange={e => this.handleFiles([...e.target.files])} />
            <Button color="primary" size="large" onClick={this.handleClick}>Upload Files</Button>
          </Col>
        </Row>
      </React.Fragment>
    )
  }
}

export default withRouter(AllFiles);

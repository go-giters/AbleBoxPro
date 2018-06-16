import React from 'react';
import FileListEntry from 'Src/components/FileListEntry.jsx';
import Dropzone from 'Src/components/Dropzone.jsx';
import Path from 'Src/components/Path.jsx';
import { withRouter } from 'react-router-dom';
import { Row, Col, Input, Button, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';
import css from 'Src/styles/AllFiles.css';
import Search from 'Src/components/Search.jsx';
import $ from 'jquery';
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
      path: [],
      allFolders: null
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
    this.getFiles = this.getFiles.bind(this);
    this.getAllFolders = this.getAllFolders.bind(this);
  }

  componentDidMount() {
    this.getFiles();
    this.getAllFolders();
  }

  getFiles() {
    $.ajax ({
      type: 'GET',
      url: '/getfiles',
      contentType: 'application/json; charset=utf-8',
      success: (data, textStatus, jqXHR) => {
        // console.log('inside getFiles data: ', data)
        // let dataObj = JSON.parse(data);
        // console.log('dataObj: ', dataObj)
        // dataObj.result.forEach(file => {
        //   let el = document.getElementById(file.id)
        //   console.log('el: ', el)
          // new Draggable(el)
        // })
        this.setState({
          files: JSON.parse(data).result,
          path: JSON.parse(data).path
        });
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        alert(errorThrown); // need to decide on what we are doing here with the error
      },
    });
  }

  getAllFolders() {
    $.ajax ({
      type: 'GET',
      url: '/getfolders',
      contentType: 'application/json; charset=utf-8',
      success: (data, textStatus, jqXHR) => {
        console.log('inside getAllFolders data: ', data)
        this.setState({
          allFolders: JSON.parse(data).result
        });
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
    // files.forEach(file => file.upload = true);
    // this.setState({
    //   files: [...this.state.files].concat(files),
    // });
  }

  saveToIpfs(reader, files) {
    let ipfsId
    const buffer = Buffer.from(reader.result)
    this.ipfsApi.add(buffer, { progress: (prog) => console.log(`received: ${prog}`) })
    .then((response) => {
      console.log('ipfs response: ', response)
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

  drop(e) {
    e.preventDefault();
    console.log('drop e.target: ', e.target.innerText)
    let folder = e.target.innerText === 'Home' ? 0 : e.target.innerText
    console.log('folder in drop: ', folder)
    let data = {
      id: e.dataTransfer.getData("id"),
      folder: folder
    }
    console.log('data inside FileListEntry drop: ', data)
    $.ajax ({
      type: 'POST',
      url: '/moveFile',
      data: data,
      success: (data, textStatus, jqXHR) => {
        console.log('data: ', data)
        this.props.getFiles();
        this.setState({
          loadingEditor: false
        });
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        this.setState({loadingEditor: false})
        console.error("DOWNLOAD ERROR", errorThrown);
      },
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

        <Dropzone files={this.state.files} handleFiles={this.handleFiles} searchMode={this.state.searchMode}>
        <Path path = {this.state.path} drop={this.drop}/>
          {this.state.files.length
            ? this.state.files.map((file, i) => <FileListEntry key={file.id || i} file={file}
              handleClickDelete={this.handleClickDelete}
              getFiles={this.getFiles}
            />)
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
    );
  }
}

export default withRouter(AllFiles);

import React from 'react';
import { Alert, Button, Row, Col, Progress, Modal } from 'reactstrap';
import moment from 'moment';
import $ from 'jquery';
import Share from './Share.jsx';
import prettyFileIcons from '../helper/pretty-file-icons';
import folderIcon from '../assets/folder.png';
import downloadIcon from '../assets/download.png';
import css from '../styles/FileListEntry.css';
import Filepath from './Filepath.jsx';
import Rename from './Rename.jsx';
import loadicon from 'Src/assets/loader.gif';

class FileListEntry extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			uploadProgress: 0,
			upload: !!this.props.file.upload,
      loadingEditor: false,
      modal: false,
      url: '',
      path: ''
		};
		this.handleDownload = this.handleDownload.bind(this);
    this.launchEditor = this.launchEditor.bind(this);
    this.toggle = this.toggle.bind(this);
    this.getFilePath = this.getFilePath.bind(this);
	}

  handleDownload(e) {
    let data = {id: this.props.file.id};

    $.ajax ({
      type: 'GET',
      url: '/download',
      data: data,
      contentType: 'image/png',
      success: (data, textStatus, jqXHR) => {
        this.setState({
          message: 'File has been downloaded to: ' + data,
        });
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        console.error('DOWNLOAD ERROR', errorThrown);
      },
    });
  }

	componentDidMount() {
    // let el = this.refs[this.props.file.id.toString()];
		if (this.state.upload) {
      console.log('this.props.file: ', this.props.file)

			const formData = new FormData();

			formData.append('file', this.props.file, this.props.file.name);
      formData.append('body', this.props.file.hash);

      const req = new XMLHttpRequest();

      req.open("POST", "/upload", true);

      req.upload.addEventListener("progress", e => {
        if (e.lengthComputable) {
          const progress = e.loaded / e.total * 100;
          this.setState({uploadProgress: progress});
          if (progress === 100) {
            setTimeout(() => {
              this.setState({upload: false});
            }, 800);
          }
        }
      }, false);

      req.onload = function(oEvent) {
        if (req.status == 200) {
          // handle success
        } else {
          // handle error
        }
      };

      req.send(formData);
    }
    this.getFilePath(this.props.file.id);
  }

  getFilePath(id) {
    $.ajax({
      method: 'GET',
      url: '/path',
      data: {fileId: id},
      dataType: 'json',
      contentType: 'application/json; charset=utf-8',
      success: (data) => {
        let pathString = 'Home';
        // console.log(this.props.file.id)
        data.forEach((thing) => {
          if (!(thing.folder_id === 0)){
            pathString += '/' + thing.name;
          }
        });
        this.setState({
          path: pathString
        });
      }
    });
  }

  launchEditor() {
    this.setState({loadingEditor: true})
    let data = {id: this.props.file.id};
    console.log('this.props.file: ', this.props.file)
    var writer = this.props.file.name.match(/\.(doc|docx|rtf|txt|odt|html|swx)$/i)
    var sheet = this.props.file.name.match(/\.(xlsx|xls|ods|sxc|csv|tsv)$/i)
    var show = this.props.file.name.match(/\.(ppt|pptx|ppsx|odp|sxi)$/i)
    console.log('writer: ', writer)
    console.log('sheet: ', sheet)

    if(writer) {
      $.ajax ({
        type: 'POST',
        url: '/launchWriter',
        data: data,
        success: (data, textStatus, jqXHR) => {
          console.log('data: ', data)
          this.setState({
            loadingEditor: false
            //uncomment to enable modal:
            // modal: true,
            // url: data
          }, () => window.open(data));
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
          this.setState({loadingEditor: false})
          console.error("DOWNLOAD ERROR", errorThrown);
        },
      });
    } else if(sheet) {
      console.log('Inside sheet')
      $.ajax ({
        type: 'POST',
        url: '/launchSheet',
        data: data,
        success: (data, textStatus, jqXHR) => {
          console.log('data: ', data)
          this.setState({
            loadingEditor: false
            //uncomment to enable modal:
            // modal: true,
            // url: data
          }, () => window.open(data));
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
          this.setState({loadingEditor: false})
          console.error("DOWNLOAD ERROR", errorThrown);
        },
      });
    }
    // else if(show) {
    //   console.log("u have ppt")
    //   $.ajax ({
    //     type: 'POST',
    //     url: '/launchShow',
    //     data: data,
    //     success: (data, textStatus, jqXHR) => {
    //       console.log('data: ', data)
    //       this.setState({
    //         loadingEditor: false
    //         //uncomment to enable modal:
    //         // modal: true,
    //         // url: data
    //       }, () => window.open(data));
    //     },
    //     error: function(XMLHttpRequest, textStatus, errorThrown) {
    //       console.error("DOWNLOAD ERROR", errorThrown);
    //     },
    //   });
    // }
    else {
      this.setState({loadingEditor: false})
      window.alert('File format not supported by editor')
    }
  }

  drag(e) {
    e.dataTransfer.setData("id", e.target.id);
  }

  drop(e) {
    e.preventDefault();
    console.log('e.target.id: ', e.target.id)
    let data = {
      id: e.dataTransfer.getData("id"),
      folder: e.target.id
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



    //update folder_id of id=data so that folder_id=
  }

  toggle() {
    this.setState({
      modal: !this.state.modal
    });
  }

  render() {
    return (
      <div>
        <Modal id="modal" isOpen={this.state.modal}>
          <iframe src={this.state.url}></iframe>
          <Button color="secondary" onClick={this.toggle}>Cancel</Button>
        </Modal>
      <Col xs="auto" className="file-list-entry py-3">
        <Row className="text-sm-center justify-content-center">
        {this.state.loadingEditor && <img src={loadicon}></img>}
          <Rename file={this.props.file} getFiles={this.props.getFiles} getFilePath={this.getFilePath}/>
          <Col xs="12" sm="8" md="auto" className="mr-md-auto text-center text-sm-left">
            {this.props.file.is_folder
              ? <img ref={this.props.file.id} id={this.props.file.id} width="32px" src={folderIcon} alt="folder icon" onDragStart={this.drag} onDrop={this.drop}/>
              : <img ref={this.props.file.id} id={this.props.file.id} width="32px" src={"/icons/" + prettyFileIcons.getIcon(this.props.file.name, "svg")} alt="file icon" onDragStart={this.drag}/>
            }
            {this.props.file.is_folder
              ? <span className="file-name align-middle ml-2 text-left"><a href={'/folder/' + this.props.file.id }>{this.props.file.name}</a></span>
              : <span className="file-name align-middle ml-2 text-left" onClick={this.launchEditor}>{this.props.file.name}</span>
            }
          </Col>
          <Col xs="12" sm="4" md="auto" className="mr-md-4 text-center text-sm-right text-md-left">
            <span className="timestamp align-middle">{moment(this.props.file.lastModified).format('MM/DD/YY h:mm a')}</span>
          </Col>
          <Col xs="auto" className={'mt-3 mt-sm-4 mt-md-0 ' + (this.props.file.is_folder ? 'd-none d-md-block' : '')}>
            <Button className={'btn btn-sm btn-outline-secondary shadow-sm ' + (this.props.file.is_folder ? 'invisible' : '')} onClick={this.handleDownload} type="download">
              <img background="transparent" src={downloadIcon} alt="Download"/>
            </Button>
          </Col>
          <Col xs="auto" className="mt-3 mt-sm-4 mt-md-0">
            <Button className="btn btn-sm btn-outline-danger" onClick={(e)=>{this.props.handleClickDelete(this.props.file.id, this.props.file.is_folder)}}>Delete</Button>
          </Col>
          <Col xs="auto" className="mt-3 mt-sm-4 mt-md-0">
            <Share file={this.props.file} share={this.share}/>
          </Col>
        </Row>
        {this.state.message
          ? (
            <Row>
              <Alert color="dark">{this.state.message}</Alert>
            </Row>
          )
          : null
        }
        {this.state.upload
          ? <Progress value={this.state.uploadProgress} className="mt-3" />
          : null
        }
        <Row noGutters={true}>
          <Filepath path={this.state.path}/>
        </Row>
      </Col>
      </div>
    );
  }
}

export default FileListEntry;

import React from 'react';
import { Alert, Button, Row, Col, Progress } from 'reactstrap';
import moment from 'moment';
import $ from 'jquery';
import Share from './Share.jsx';
import prettyFileIcons from '../helper/pretty-file-icons';
import folderIcon from '../assets/folder.png';
import downloadIcon from '../assets/download.png';
import css from '../styles/FileListEntry.css';
import Filepath from './Filepath.jsx';
import Rename from './Rename.jsx';

class FileListEntry extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      uploadProgress: 0,
      upload: !!this.props.file.upload,
      path: ''
    };
    this.handleDownload = this.handleDownload.bind(this);
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
    if (this.state.upload) {
      const formData = new FormData();

      formData.append('file', this.props.file, this.props.file.name);

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

  render() {
    return (
      <Col xs="auto" className="file-list-entry py-3">
        <Row className="text-sm-center justify-content-center">
          <Rename file={this.props.file} getFiles={this.props.getFiles} getFilePath={this.getFilePath}/>
          <Col xs="12" sm="8" md="auto" className="mr-md-auto text-center text-sm-left">
            {this.props.file.is_folder
              ? <img width="32px" src={folderIcon} alt="folder icon"/>
              : <img width="32px" src={"/icons/" + prettyFileIcons.getIcon(this.props.file.name, "svg")} alt="file icon"/>
            }
            {this.props.file.is_folder
              ? <span className="file-name align-middle ml-2 text-left"><a href={'/folder/' + this.props.file.id }>{this.props.file.name}</a></span>
              : <span className="file-name align-middle ml-2 text-left" >{this.props.file.name}</span>
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
    );
  }
}

export default FileListEntry;

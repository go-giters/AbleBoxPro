import React from 'react';
import FileListEntry from 'Src/components/FileListEntry.jsx';
import Dropzone from 'Src/components/Dropzone.jsx';
import Path from 'Src/components/Path.jsx';
import { withRouter } from 'react-router-dom';
import { Row, Col, Input, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import css from 'Src/styles/AllFiles.css';
import Search from 'Src/components/Search.jsx';
import $ from "jquery";
import createFolderIcon from 'Src/assets/createFolder.png';
import { debounce } from 'lodash';
import web3 from '../web3.js';
import ipfs from '../ipfs.js';
import storehash from '../storehash.js';
import ipfsAPI from 'ipfs-api';


class AllFiles extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      files: null,
      searchMode: false,
      folderName: '',
      path: [],
      ipfsHash:null,
      buffer:'',
      ethAddress:'',
      blockNumber:'',
      transactionHash:'',
      gasUsed:'',
      txReceipt: '',
      currentFile: null,
      hash: null
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
    // this.convertToBuffer = this.convertToBuffer.bind(this);
    // this.onSubmit = this.onSubmit.bind(this);
    this.onClick = this.onClick.bind(this);
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
    // let buffreader = new window.FileReader()
    // buffreader.onloadend = () => this.saveToIpfs(buffreader)
    // buffreader.readAsArrayBuffer(files[0]);

    // console.log('handleFiles is being called')
    // if (files[0]) {
    //   console.log(files[0])
    //   let urlreader = new FileReader();
    //   urlreader.onload = function(e) {
    //     console.log('e.target.result: ', e.target.result);
    //   }
    //   reader.readAsDataURL(files[0]);
    // }

    let reader = new window.FileReader()
    reader.readAsArrayBuffer(files[0])
    reader.onloadend = () => {
      // this.convertToBuffer(reader);
      this.saveToIpfs(reader, files);
    }
    // add upload key to trigger upload upon FileListEntry mount
    // files.forEach(file => {
    //   file.upload = true;
    //   file.hash = this.state.hash
    // });
    // this.setState({
    //   files: [...this.state.files].concat(files),
    // });
  }

  saveToIpfs(reader, files) {

    let ipfsId
    const buffer = Buffer.from(reader.result)
    this.ipfsApi.add(buffer, { progress: (prog) => console.log(`received: ${prog}`) })
      .then((response) => {
        console.log(response)
        ipfsId = response[0].hash
        console.log('ipfsId: ', ipfsId)
        var fileLocation = 'https://ipfs.io/ipfs/' + ipfsId
        console.log('fileLocation: ', fileLocation)
        this.setState({hash: ipfsId}, () => {
          files.forEach(file => {
            file.upload = true;
            file.hash = this.state.hash
            console.log('file: ', file)
          });
          this.setState({
            files: [...this.state.files].concat(files),
          });
        })
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

  // async convertToBuffer(reader) {
  //   console.log('convertToBuffer is being called')
  //   const buffer = await Buffer.from(reader.result);
  //   this.setState({buffer}, () => this.onSubmit());
  // }

  // async onSubmit() {
  //   console.log('storehash: ', storehash)
  //   //upload file to IPFS
  //   const accounts = await web3.eth.getAccounts();
  //   console.log('Sending from Metamask account: ' + accounts[0]);
  //   const ethAddress = await storehash.options.address;
  //   this.setState({ethAddress});
  //   await ipfs.add(this.state.buffer, (err, ipfsHash) => {
  //     console.log(err,ipfsHash);
  //     this.setState({ ipfsHash:ipfsHash[0].hash }, () => {
  //       console.log('set ipfsHash')
  //       storehash.methods.sendHash(this.state.ipfsHash).send({
  //         //this requires an accept through metamask plugin in order to continue
  //         from: accounts[0]
  //       }, (error, transactionHash) => {
  //         console.log('line 128')
  //         console.log(transactionHash);
  //         this.setState({transactionHash}, this.onClick());
  //       });
  //     });

  //   })
  // };


async onClick() {
  console.log('onClick is being called')
  //get Ethereum receipt
  try {
    this.setState({blockNumber:"waiting.."});
    this.setState({gasUsed:"waiting..."});
//get Transaction Receipt in console on click
//See: https://web3js.readthedocs.io/en/1.0/web3-eth.html#gettransactionreceipt
    await web3.eth.getTransactionReceipt(this.state.transactionHash, (err, txReceipt)=>{
      console.log('txReceipt: ', txReceipt)
      console.log(err,txReceipt);
      this.setState({txReceipt});
    }); //await for getTransactionReceipt
    await this.setState({blockNumber: this.state.txReceipt.blockNumber});
    await this.setState({gasUsed: this.state.txReceipt.gasUsed});
  } //try
  catch(error){
    console.log(error);
  } //catch
} //onClick






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
            ? this.state.files.map((file, i) => <FileListEntry key={i} file={file} handleClickDelete={this.handleClickDelete}/>)
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

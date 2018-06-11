import React from 'react';
import $ from 'jquery';

class Filepath extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      path: '/test'
    }
  }

  componentDidMount() {
    $.ajax({
      method: 'GET',
      url: '/path',
      data: {fileId: this.props.file.id},
      dataType: 'json',
      contentType: 'application/json; charset=utf-8',
      success: (data) => {
        let pathString = 'Home'
        // console.log(this.props.file.id)
        data.forEach((thing) => {
          if (!(thing.folder_id === 0)){
            pathString += '/' + thing.name;
          }
        })
        this.setState({
          path: pathString
        })
      }
    })
  }

  render() {
    return (
      <span>
        <p className="text-muted" fontSize="6px">{this.state.path}</p>
      </span>
    )
  }
}

export default Filepath;

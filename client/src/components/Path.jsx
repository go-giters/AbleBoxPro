import React from 'react';
import { Col, Row, Breadcrumb, BreadcrumbItem } from 'reactstrap';

class Path extends React.Component {
    constructor(props) {
      super(props);
      this.state = {};
    }

    render() {
      return (
      <Row className="mt-3">
        <Col xs="12">
          <Breadcrumb>
            {this.props.path.length > 0
              ? <BreadcrumbItem><a ref="bd" onDrop={this.props.drop} href="/home">Home</a></BreadcrumbItem>
              : <BreadcrumbItem active>Home</BreadcrumbItem>
            }
            {this.props.path.length > 3
              ? <BreadcrumbItem>...</BreadcrumbItem>
              : null
            }
            {this.props.path.slice(this.props.path.length > 3 ? -3 : 0).map((folder, i, arr) => (
              folder.name
                ? (
                    i === arr.length - 1
                    ? <BreadcrumbItem key={i}>{folder.name}</BreadcrumbItem>
                    : <BreadcrumbItem key={i}><a href={'/folder/' + folder.folder_id}>{folder.name}</a></BreadcrumbItem>
                  )
                : null
              )
            )}
          </Breadcrumb>
        </Col>
      </Row>
    )
  }
}



export default Path;




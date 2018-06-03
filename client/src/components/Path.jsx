import React from 'react';
import { Col, Row, Breadcrumb, BreadcrumbItem } from 'reactstrap';

const Path = ({path}) => (
  <Row className="mt-3">
    <Col xs="12">
      <Breadcrumb>
        {path.length > 0
          ? <BreadcrumbItem><a href="/home">Home</a></BreadcrumbItem>
          : <BreadcrumbItem active>Home</BreadcrumbItem>
        }
        {path.length > 3
          ? <BreadcrumbItem>...</BreadcrumbItem>
          : null
        }
        {path.slice(path.length > 3 ? -3 : 0).map((folder, i, arr) => (
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

export default Path;




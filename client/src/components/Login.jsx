import React from 'react';
import { Row, Col, Button, Form, FormGroup, FormControl, Label, Input } from 'reactstrap';
import { withRouter } from 'react-router-dom';
import $ from 'jquery';
import ipfsAPI from 'ipfs-api';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: ''
    };

    this.ipfsApi = ipfsAPI('localhost', '5001');

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    var parsedUrl = new URL(window.location.href);
console.log(parsedUrl.searchParams); // 123
    console.log('window.url: ', Window.URL)
    console.log('document.domain: ', document.domain)
  }

  handleChange(e) {
    e.preventDefault();
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    var data = {
      email: this.state.email,
      password: this.state.password
    };
    $.ajax ({
      type: 'POST',
      url: '/login',
      data: JSON.stringify(data),
      contentType: 'application/json; charset=utf-8',
    })
    .done(() => {
      this.props.history.push('/home');
    })
    .fail(() => {
      alert('failed to login');
    });
  }



  render() {
    return (
      <div color="light">
          <div>
          <br/>
            <h2 color="light" className="text-center font-weight-bold" id="signInTitle"> Sign In </h2>
          </div>
          <br/>
            <Form onSubmit={this.handleSubmit}>
              <Row>
                <Col xs={{ size: 8, offset: 2 }} sm={{ size: 6, offset: 3 }} md={{ size: 6}} lg={{ size: 6}}>
                  <FormGroup>
                    <Label for="email">Email Address</Label>
                    <Input type="text" name="email" placeholder="email address" onChange={this.handleChange}></Input>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col xs={{ size: 8, offset: 2 }} sm={{ size: 6, offset: 3 }} md={{ size: 6}} lg={{ size: 6}}>
                  <FormGroup>
                    <Label for="password">Password</Label>
                    <Input type="password" name="password" placeholder="password" onChange={this.handleChange}></Input>
                  </FormGroup>
                </Col>
              </Row>
              <br/>
              <Button className="d-block mx-auto btn-outline-primary" type="submit">Login</Button>
            </Form>
          { !this.ipfsApi.id() && <footer className="footer">
          <p className="text-muted">This app utilizes block-chain decentralized file storage. Please <a href="https://ipfs.io/docs/install/">download ipfs</a> and configure with the following command-line heades in order to enable this feature</p>
          <div className="text-muted">ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin "[\"http://example.com\"]"</div>
          <div className="text-muted">ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials "[\"true\"]"</div>
          <div className="text-muted">ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods "[\"PUT\", \"POST\", \"GET\"]"</div>
          </footer> }
      </div>
    )
  }
}

export default withRouter(Login);

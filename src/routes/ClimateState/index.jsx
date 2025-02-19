import React from 'react'
import { Col, Container, Image, Row } from 'react-bootstrap';
import ENSO from '../../assets/enso1.gif';
import IOD from '../../assets/iod1.gif';
import PDO from '../../assets/MJO1.gif';
import ENSOP from '../../assets/ENSOProb.mp4';
import IOD2 from '../../assets/IOD2video.mp4';
import './style.css';
const ClimateState = () => {
  return (
    <>
      <Container fluid >
        <Row>
          <Col md={4} className='my-3'>
            <Image src={ENSO} className='rounded-3' alt="ENSO" fluid />
          </Col>
          <Col md={4} className='my-3'>
            <Image src={IOD} className='rounded-3' alt="IOD" fluid />
          </Col>
          <Col md={4} className='my-3'>
            <Image src={PDO} className='rounded-3' alt="PDO" fluid />
          </Col>
        </Row>
        <Row>
          <Col md={6} className='d-flex justify-content-center align-items-center'>
            <video autoPlay loop muted className="climate-video rounded-3">
              <source src={ENSOP}  type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </Col>
          <Col md={6} className='d-flex justify-content-center align-items-center'>
            <video autoPlay loop muted className="climate-video rounded-3">
              <source src={IOD2} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ClimateState;


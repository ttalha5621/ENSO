import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import SimexVideo from '../../assets/scenario.mp4';
import './simex.css';

const Simex = () => {
    return (
        <>
            <Container fluid >
                <Row>
                    <Col md={12}>
                        <div className="video-container">
                            <video autoPlay loop muted className="video">
                                <source src={SimexVideo} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default Simex;
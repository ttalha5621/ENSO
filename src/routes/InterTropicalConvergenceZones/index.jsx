import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import ITCZVideo from '../../assets/19.mp4';
import './itcz.css';

const InterTropicalConvergenceZones = () => {
    return (
        <>


            <Container fluid >
                <Row>
                    <Col md={12}>
                        <div className="video-container">
                            <video autoPlay loop muted className="video">
                                <source src={ITCZVideo} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default InterTropicalConvergenceZones
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Video from '../../assets/WeatherPatterns.mp4';
import './style.css';

const WeatherPatterns = () => {
    return (
        <>
            <Container fluid >
                <Row>
                    <Col md={12}>
                        <div className="video-container">
                            <video autoPlay loop muted className="video">
                                <source src={Video} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default WeatherPatterns;
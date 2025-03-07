import React, { useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Video from '../../assets/WeatherPatterns.mp4';
import './style.css';
import { useNavbar } from '../../components/NavbarContext';

const WeatherPatterns = () => {
    const { setNavBackgroundColor } = useNavbar();

    useEffect(() => {
        setNavBackgroundColor('linear-gradient(to bottom, rgba(0,0,139), rgba(128,128,128))');

        return () => {
            setNavBackgroundColor('#1a1a1a');
        };
    }, [setNavBackgroundColor]);

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
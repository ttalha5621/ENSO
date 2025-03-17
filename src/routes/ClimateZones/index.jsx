import React, { useEffect, useRef } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './climate.css';
import { useNavbar } from '../../components/NavbarContext';

const ClimateZones = () => {
    const iframeRef = useRef(null);
    const { setNavBackgroundColor } = useNavbar();

    useEffect(() => {
        setNavBackgroundColor('linear-gradient(to bottom, rgba(0,0,139), rgba(128,128,128))');
        return () => {
            setNavBackgroundColor('#1a1a1a'); // Reset to default color
        };
    }, [setNavBackgroundColor]);

    return (
        <Container fluid className="d-flex justify-content-center align-items-center mt-3" style={{ height: '90vh' }}>
            <Row className="w-100">
                <Col md={12} className="d-flex justify-content-center">
                    {/* Wrapper div for background color and scrollbar masking */}
                    <div style={{
                        width: '95%',
                        height: '90vh',
                        overflow: 'hidden',
                        borderRadius: '10px',
                        position: 'relative',
                    }}>
                        {/* Iframe */}
                        <iframe className="i-border" ref={iframeRef}
                            src="https://fluid-earth.byrd.osu.edu/#date=2025-03-11T00%3A00%3A00.000Z&gdata=sea+surface+temperature&pdata=none&proj=equirectangular&lat=33.49&lon=60.96&zoom=1.95&smode=false&kmode=false&pins=%5B%5D"
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                zIndex: 0,
                                backgroundColor: 'black',
                            }}
                            title="Climate Zones Live Feed"
                            // scrolling="no" /* Disable scrolling */
                            allow="fullscreen"
                        ></iframe>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default ClimateZones;
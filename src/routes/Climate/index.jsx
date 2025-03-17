import React, { useEffect, useRef } from 'react'
import { Col, Container, Row } from 'react-bootstrap';
import { useNavbar } from '../../components/NavbarContext';

const Climate = () => {
    const iframeRef = useRef(null);
    const { setNavBackgroundColor } = useNavbar();

    useEffect(() => {
        setNavBackgroundColor('linear-gradient(to bottom, rgba(0,0,139), rgba(242,120,75))');
        return () => {
            setNavBackgroundColor('#1a1a1a');
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
                        <iframe className="iframe" ref={iframeRef}
                            src="https://fluid-earth.byrd.osu.edu/#date=2025-02-01T00%3A00%3A00.000Z&gdata=average+temperature+at+2+m+above+ground&pdata=none&proj=equirectangular&lat=33.49&lon=60.96&zoom=1.95&smode=false&kmode=false&pins=%5B%5D"
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


export default Climate
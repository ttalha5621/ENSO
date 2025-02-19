import React, { useRef } from 'react'
import { Col, Container, Row } from 'react-bootstrap';

const Climate = () => {
    const iframeRef = useRef(null);

    return (
        <Container fluid>
            <Row>
                <Col md={12} className='d-flex justify-content-md-around my-3'>
                    {/* Wrapper div for background color and scrollbar masking */}
                    <div style={{
                        width: '100%',
                        height: '90vh',
                        overflow: 'hidden',
                        borderRadius: '10px',
                        position: 'relative',
                    }}>
                        {/* Iframe */}
                        <iframe
                            ref={iframeRef}
                            src="https://fluid-earth.byrd.osu.edu/#date=2024-12-01T00%3A00%3A00.000Z&gdata=average+temperature+at+2+m+above+ground&pdata=none&proj=equirectangular&lat=33.49&lon=60.96&zoom=1.95&smode=false&kmode=false&pins=%5B%5D"
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
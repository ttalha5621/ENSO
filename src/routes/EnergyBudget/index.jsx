import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';

const EnergyBudget = () => {

    return (
        <>
            <Container fluid >
                <Row>
                    <Col md={12}>

                        <div id="iframeContainer" className='mt-3 pt-3 rounded-2 ' style={{ width: '100%', height: '90vh' }}>
                            <iframe
                                src="https://earth.nullschool.net/#current/ocean/surface/level/overlay=sea_surface_temp/patterson=137.56,4.44,413/loc=67.842,22.152"
                                style={{ border: 0, width: '100%', height: '100%' }}
                                title="Sea Surface Temperature"
                            ></iframe>
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default EnergyBudget;
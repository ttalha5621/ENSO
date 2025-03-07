import React, { useEffect } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useNavbar } from '../../components/NavbarContext';

const EnergyBudget = () => {
        const { setNavBackgroundColor } = useNavbar();
    
        useEffect(() => {
            setNavBackgroundColor('linear-gradient(to bottom, rgba(0,0,139), rgba(128,128,128))');
            return () => {
                setNavBackgroundColor('#1a1a1a'); // Reset to default color
            };
        }, [setNavBackgroundColor]);

    return (
        <>
            <Container fluid >
                <Row>
                    <Col md={12} className='d-flex justify-content-md-around my-2'>
                        <div id="iframeContainer" className='mt-2 pt-2 rounded-2 ' style={{ width: '95%', height: '90vh' }}>
                            <iframe
                                src="https://earth.nullschool.net/#current/ocean/surface/level/overlay=sea_surface_temp/patterson=137.56,4.44,413/loc=67.842,22.152"
                                style={{ border: 0, width: '100%', height: '100%', borderRadius: '10px' }}
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
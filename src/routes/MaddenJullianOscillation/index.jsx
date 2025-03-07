import React, { useEffect } from 'react';
import { Col, Container, Image, Row } from 'react-bootstrap';
import MJO from '../../assets/7.gif';
import MJOVideo from '../../assets/12.mp4';
import { useNavbar } from '../../components/NavbarContext';

const MaddenJullaianOscillation = () => {
        const { setNavBackgroundColor } = useNavbar();
    
        useEffect(() => {
            setNavBackgroundColor('linear-gradient(to bottom, rgba(0,0,139), rgba(144,198,149))');
            return () => {
                setNavBackgroundColor('#1a1a1a');
            };
        }, [setNavBackgroundColor]);
    return (
        <>
            <Container fluid style={{ overflow: 'hidden', overflowY: 'hidden' }}>
                <Row >
                    {/* </Row>
                <Row > */}
                    <Col md={12} className='d-flex justify-content-center  my-3'>
                        <video autoPlay loop muted className='rounded-3' style={{ width: '68%', height: '100%' }}>
                            <source src={MJOVideo} type="video/mp4" fluid />
                            Your browser does not support the video tag.
                        </video>
                    </Col>
                    <Col md={12} className='d-flex justify-content-center  my-3'>
                        <Image src={MJO} className='rounded-3' alt="Madden Jullaian Oscillation" style={{ width: '48%', height: 'auto' }} />
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default MaddenJullaianOscillation;
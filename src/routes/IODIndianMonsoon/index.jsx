import React, { useEffect } from 'react'
import { Container, Row, Col, Image } from 'react-bootstrap'
import IOD1 from '../../assets/15.mp4'
import IOD2 from '../../assets/18.mp4'
// import IOD3 from '../../assets/16.jpg'
import IOD4 from '../../assets/IOD_plume_test.png'
import IOD5 from '../../assets/proba_IOD_test.png'
import { useNavbar } from '../../components/NavbarContext'

const IODIndianMonsoon = () => {
    const { setNavBackgroundColor } = useNavbar();

    useEffect(() => {
        setNavBackgroundColor('linear-gradient(to bottom, rgba(0,0,139), rgba(218,165,32))');
        return () => {
            setNavBackgroundColor('#1a1a1a');
        };
    }, [setNavBackgroundColor]);
    return (
        <>
            <Container fluid >
                <Row>
                    <Col md={6} className='my-5 d-flex justify-content-center'>
                        <video autoPlay loop muted width={750} className='rounded-3'>
                            <source src={IOD1} type="video/mp4" id />
                            Your browser does not support the video tag.
                        </video>
                    </Col>
                    <Col md={6} className='my-5 d-flex justify-content-center '>
                        <video autoPlay loop muted width={750} className='rounded-3'>
                            <source src={IOD2} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </Col>
                    </Row>
                    <Row>
                    <Col md={6} className='my-4 d-flex justify-content-center '>
                        <Image src={IOD4} type="image/jpg" className='rounded-3 w-75 ' fluid />
                        {/* <Image src={IOD5} type="image/jpg" className='rounded-3 w-25' fluid /> */}
                    </Col>
                    <Col md={6} className='my-4 d-flex justify-content-center '>
                        {/* <Image src={IOD4} type="image/jpg" className='rounded-3 w-25 ' fluid /> */}
                        <Image src={IOD5} type="image/jpg" className='rounded-3 w-75' fluid />
                    </Col>
                </Row>
            </Container>
        </>
    )
};


export default IODIndianMonsoon
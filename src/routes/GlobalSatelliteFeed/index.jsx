import React, { useEffect, useRef, useState } from "react";
import { Container, Button, Row, Col, Card } from "react-bootstrap";
import { useNavbar } from "../../components/NavbarContext";

const GlobalSatelliteFeed = () => {
    const iframeRef = useRef(null);
    const { setNavBackgroundColor } = useNavbar();
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        setNavBackgroundColor('rgba(26, 26, 26, 0.6)'); 
        return () => {
            setNavBackgroundColor('#1a1a1a');
        };
    }, [setNavBackgroundColor]);

    const iframeData = [
        {
            title: "Satellite Constellations",
            src: "https://eyes.nasa.gov/apps/earth/#/vital-signs/visible-earth/viirs-infrared-daily"
        },
        {
            title: "Air Temperature",
            src: "https://eyes.nasa.gov/apps/earth/#/vital-signs/air-temperature/airs-infrared-surface-3day"
        },
        {
            title: "Water Vapor",
            src: "https://eyes.nasa.gov/apps/earth/#/vital-signs/water-vapor/airs-atmospheric-precipitable-total-3day"
        },
        {
            title: "Carbon Dioxide",
            src: "https://eyes.nasa.gov/apps/earth/#/vital-signs/carbon-dioxide/oco-2-carbon-observatory-16day"
        },
        {
            title: "Carbon Monoxide",
            src: "https://eyes.nasa.gov/apps/earth/#/vital-signs/carbon-monoxide/airs-infrared-18000ft-3day"
        },
        {
            title: "Precipitation",
            src: "https://eyes.nasa.gov/apps/earth/#/vital-signs/precipitation/imerg-multi-satellite-retrievals-daily"
        },
        {
            title: "Soil Moisture",
            src: "https://eyes.nasa.gov/apps/earth/#/vital-signs/soil-moisture/smap-saturation-8day"
        },
        {
            title: "Salinity",
            src: "https://eyes.nasa.gov/apps/earth/#/vital-signs/chlorophyll/chlorophyll-today"
        },
        {
            title: "Ozone",
            src: "https://eyes.nasa.gov/apps/earth/#/vital-signs/ozone/omps-atmosphere-daily"
        },
        {
            title: "Sea Level",
            src: "https://eyes.nasa.gov/apps/earth/#/vital-signs/sea-level/ocean-climate-measurements-monthly"
        },
        {
            title: "Water Storage",
            src: "https://eyes.nasa.gov/apps/earth/#/vital-signs/gravity-field-map/water-storage-monthly"
        },
        {
            title: "Nitrous Oxide",
            src: "https://eyes.nasa.gov/apps/earth/#/vital-signs/nitrous-oxide/mls-stratosphere-n2o-7day"
        }
    ];

    const handleNext = () => {
        if (currentIndex + 3 < iframeData.length) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    return (
        <>
            <Container fluid className='mt-3'>
                <Row>
                    {iframeData.slice(currentIndex, currentIndex + 3).map((iframe, index) => (
                        <Col md={4} key={index} className="d-flex flex-column justify-content-center align-items-center">
                            <Card style={{ width: '100%', height: '85vh' }}>
                                <Card.Header>{iframe.title}</Card.Header>
                                <Card.Body className='p-2'>
                                    <iframe
                                        title={iframe.title}
                                        width="100%"
                                        src={iframe.src}
                                        allowFullScreen
                                        ref={iframeRef}
                                        style={{
                                            borderRadius: '10px',
                                            height: '100%',
                                        }}
                                    />
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
                <Row className="mt-3 mx-3">
                    <Col className="d-flex justify-content-between">
                        <Button onClick={handlePrev} disabled={currentIndex === 0}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-left-fill" viewBox="0 0 16 16">
                                <path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z" />
                            </svg>
                        </Button>
                        <Button onClick={handleNext} disabled={currentIndex + 3 >= iframeData.length}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-right-fill" viewBox="0 0 16 16">
                                <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z" />
                            </svg>
                        </Button>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default GlobalSatelliteFeed;
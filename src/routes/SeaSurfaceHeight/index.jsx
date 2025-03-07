import React, { useEffect, useRef, useState } from 'react'
import { Button, Col, Container, Image, Row } from 'react-bootstrap';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Height from '../Globe/SeaSurfaceHeight/index.jsx';
import Salinity from '../Globe/SeaSurfaceSalinity/index.jsx';
import { useNavbar } from '../../components/NavbarContext.jsx';
import image from '../../assets/c.png'


mapboxgl.accessToken = 'pk.eyJ1IjoiZW5ncmtpIiwiYSI6ImNrc29yeHB2aDBieDEydXFoY240bXExcWoifQ.WS7GVtVGZb4xgHn9dleszQ';

const SeaSurfaceHeight = () => {
    const { setNavBackgroundColor } = useNavbar();
    const mapRef = useRef(null);
    const intervalId = useRef(null);
    const userInteracting = useRef(false);
    const [isPlaying, setIsPlaying] = useState(true);

    useEffect(() => {
        setNavBackgroundColor('linear-gradient(to bottom, rgba(0,0,139), rgba(144,198,149))');
        return () => {
            setNavBackgroundColor('#1a1a1a'); // Reset to default color
        };
    }, [setNavBackgroundColor]);

    useEffect(() => {
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/satellite-streets-v11',
            zoom: 2.5,
            center: [69.3451, 30.3753],
            projection: 'mercator'
        });

        mapRef.current = map;

        // Add Mapbox controls
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        map.on('load', () => {
            map.addSource('seasurfaceheight', {
                'type': 'raster',
                'tiles': [
                    'https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&LAYERS=JPL_MEaSUREs_L4_Sea_Surface_Height_Anomalies&VERSION=1.3.0&FORMAT=image/png&TRANSPARENT=true&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}'
                ],
                'tileSize': 512
            });

            map.addLayer({
                'id': 'seasurfaceheight',
                'type': 'raster',
                'source': 'seasurfaceheight',
                'paint': { 'raster-opacity': 0.85 },
            });
            map.setLayoutProperty('seasurfaceheight', 'visibility', 'visible');
        });

        const secondsPerRevolution = 120;
        const maxSpinZoom = 10;
        const slowSpinZoom = 1;

        const spinGlobe = () => {
            const zoom = map.getZoom();
            if (isPlaying && !userInteracting.current && zoom < maxSpinZoom) {
                let distancePerSecond = 360 / secondsPerRevolution;
                if (zoom > slowSpinZoom) {
                    const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
                    distancePerSecond *= zoomDif;
                }
                const center = map.getCenter();
                center.lng -= distancePerSecond;
                map.easeTo({ center, duration: 1000, easing: (n) => n });
            }
        };

        intervalId.current = setInterval(spinGlobe, 1000);

        const handleMouseDown = () => {
            if (!isPlaying) {
                userInteracting.current = true;
            }
        };

        const handleMouseUp = () => {
            if (!isPlaying) {
                userInteracting.current = false;
                spinGlobe();
            }
        };

        map.on('mousedown', handleMouseDown);
        map.on('mouseup', handleMouseUp);
        map.on('dragend', handleMouseUp);
        map.on('pitchend', handleMouseUp);
        map.on('rotateend', handleMouseUp);
        map.on('moveend', spinGlobe);

        return () => {
            clearInterval(intervalId.current);
            map.off('mousedown', handleMouseDown);
            map.off('mouseup', handleMouseUp);
            map.off('dragend', handleMouseUp);
            map.off('pitchend', handleMouseUp);
            map.off('rotateend', handleMouseUp);
            map.off('moveend', spinGlobe);
            map.remove();
        };
    }, [isPlaying]);

    const togglePlayPause = () => {
        setIsPlaying(!isPlaying);
        if (!isPlaying) {
            userInteracting.current = false;
        }
    };


    return (
        <>
            <Container fluid className=''>
                <Row>
                    <Col md={9} className='px-5'>
                        <div id="map" className='mt-3 pt-3 i-border position-relative' style={{
                            width: '100%',
                            height: '88.5vh',
                            borderRadius: '10px'
                        }}>
                            <div className="position-absolute top-0 start-50 translate-middle-x mt-1"
                                style={{
                                    zIndex: 1000,
                                    pointerEvents: 'none'
                                }}>
                                <h5 className='mt-0 text-center mx-3 px-3 title'>Sea Surface Height</h5>
                            </div>
                            <div className="position-absolute bottom-0 start-50 translate-middle-x mb-1"
                                style={{
                                    zIndex: 1000,
                                    pointerEvents: 'none'
                                }}>
                                <Image src={image} alt='Sea Surface Temp' fluid />
                            </div>
                        </div>
                        <Button onClick={togglePlayPause} className="mt-2">
                            {isPlaying ? 'Pause' : 'Play'}
                        </Button>
                    </Col>
                    <Col md={3} className='px-3'>
                        <Row>
                            <Col md={12}>
                                <Height />
                                <h5 className='my-1 text-center mx-3 title'>Sea Surface Height</h5>
                            </Col>
                            <Col md={12}>
                                <Salinity />
                                <h5 className='my-1 text-center mx-3 title'>Sea Surface Salinity</h5>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container>
        </>
    );
};


export default SeaSurfaceHeight
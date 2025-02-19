import React, { useEffect, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Height from '../Globe/SeaSurfaceHeight/index.jsx';
import Salinity from '../Globe/SeaSurfaceSalinity/index.jsx';



mapboxgl.accessToken = 'pk.eyJ1IjoiZW5ncmtpIiwiYSI6ImNrc29yeHB2aDBieDEydXFoY240bXExcWoifQ.WS7GVtVGZb4xgHn9dleszQ';

const PrecipitationRate = () => {
    const [isMoving, setIsMoving] = useState(true);
    const [mouseMoved, setMouseMoved] = useState(false);

    useEffect(() => {
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/satellite-streets-v11',
            zoom: 2.5,
            center: [69.3451, 30.3753],
            projection: 'mercator'
        });

        // Disable default zoom controls
        map.scrollZoom.disable();
        map.boxZoom.disable();
        map.doubleClickZoom.disable();
        map.touchZoomRotate.disable();

        map.on('load', () => {
            map.addSource('precipitationrate', {
                'type': 'raster',
                'tiles': [
                    'https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&LAYERS=AMSRU2_Surface_Precipitation_Day&VERSION=1.3.0&FORMAT=image/png&TRANSPARENT=true&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}'
                ],
                'tileSize': 128
            });

            map.addLayer({
                'id': 'precipitationrate',
                'type': 'raster',
                'source': 'precipitationrate',
                'paint': { 'raster-opacity': 1 },
            });
            map.setLayoutProperty('precipitationrate', 'visibility', 'visible');
        });

        const moveMap = () => {
            if (isMoving) {
                let center = map.getCenter();
                center.lng += 0.1;
                map.flyTo({ center, essential: true });
            }
        };

        const intervalId = setInterval(moveMap, 100);

        const handleMapClick = () => {
            setIsMoving(false);
        };

        const handleMouseStop = () => {
            setMouseMoved(false);
            setTimeout(() => {
                if (!mouseMoved) {
                    setIsMoving(true);
                }
            }, 1000);
        };

        map.on('click', handleMapClick);
        map.on('mouseout', handleMouseStop);

        return () => {
            clearInterval(intervalId);
            map.off('click', handleMapClick);
            map.off('mouseout', handleMouseStop);
            map.remove();
        };
    }, [isMoving, mouseMoved]);

    return (
        <>
            <Container fluid className=''>
                <Row>
                    <Col md={9}>
                    <div id="map" className='mt-3 pt-3' style={{ width: '100%', height: '90vh', borderRadius: '10px' }}></div>
                    </Col>
                    <Col md={3}>
                        <Row>
                            <Col md={12}>
                                <Height />
                                <h5 className='text-white my-1 text-center'>Sea Surface Height</h5>
                            </Col>
                            <Col md={12}>
                                <Salinity />
                                <h5 className='text-white my-1 text-center'>Sea Surface Salinity</h5>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default PrecipitationRate
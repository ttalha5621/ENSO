import React, { useEffect } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoiZW5ncmtpIiwiYSI6ImNrc29yeHB2aDBieDEydXFoY240bXExcWoifQ.WS7GVtVGZb4xgHn9dleszQ';

const SeaSurfaceSalinity = () => {
    useEffect(() => {
        const map = new mapboxgl.Map({
            container: 'sss-map',
            style: 'mapbox://styles/mapbox/standard-satellite',
            zoom: 1.15,
            center: [69.3451, 30.3753],
            projection: 'globe'
        });

        // Disable default zoom controls
        map.scrollZoom.disable();
        map.boxZoom.disable();
        map.doubleClickZoom.disable();
        map.touchZoomRotate.disable();

        map.on('load', () => {
            map.addSource('mapbox-dem', {
                'type': 'raster-dem',
                'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
                'tileSize': 512,
                'maxzoom': 14
            });

            map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

            map.addLayer({
                'id': 'sky',
                'type': 'sky',
                'paint': {
                    'sky-type': 'atmosphere',
                    'sky-atmosphere-sun': [0.0, 0.0],
                    'sky-atmosphere-sun-intensity': 15
                }
            });

            map.addSource('seasurfacesalinity', {
                'type': 'raster',
                'tiles': [
                    'https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&LAYERS=SMAP_L3_Sea_Surface_Salinity_CAP_8Day_RunningMean&VERSION=1.3.0&FORMAT=image/png&TRANSPARENT=true&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}'
                ],
                'tileSize': 512
            });

            map.addLayer({
                'id': 'seasurfacesalinity',
                'type': 'raster',
                'source': 'seasurfacesalinity',
                'paint': { 'raster-opacity': 1 },
            });
            map.setLayoutProperty('seasurfacesalinity', 'visibility', 'visible');
        });

        return () => {
            map.remove();
        };
    }, []);

    return (
        <Container fluid>
            <Row>
                <Col md={12}>
                    <div id="sss-map" className='mt-3 i-border' style={{ width: '100%', height: '40vh', borderRadius: '10px' }}></div>
                </Col>
            </Row>
        </Container>
    );
};

export default SeaSurfaceSalinity;
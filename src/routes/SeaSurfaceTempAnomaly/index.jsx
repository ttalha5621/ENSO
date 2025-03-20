import React, { useEffect, useRef, useState } from 'react';
import { Col, Container, Image, Row } from 'react-bootstrap';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Height from '../Globe/SeaSurfaceHeight/index.jsx';
import Salinity from '../Globe/SeaSurfaceSalinity/index.jsx';
import { useNavbar } from '../../components/NavbarContext.jsx';
import image from '../../assets/e.png'
import { FaPause, FaPlay } from 'react-icons/fa';
import ReactDOMServer from 'react-dom/server';

mapboxgl.accessToken = 'pk.eyJ1IjoiZW5ncmtpIiwiYSI6ImNrc29yeHB2aDBieDEydXFoY240bXExcWoifQ.WS7GVtVGZb4xgHn9dleszQ';

const SeaSurfaceTempAnamoly = () => {
    const { setNavBackgroundColor } = useNavbar();
    const mapRef = useRef(null);
    const intervalId = useRef(null);
    const userInteracting = useRef(false);
    const [isPlaying, setIsPlaying] = useState(true);

    useEffect(() => {
        setNavBackgroundColor('linear-gradient(to bottom, rgba(0,0,139), rgba(218,165,32))');
        return () => {
            setNavBackgroundColor('#1a1a1a');
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
            map.addSource('seasurfaceanomaly', {
                'type': 'raster',
                'tiles': [
                    'https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&LAYERS=GHRSST_L4_MUR_Sea_Surface_Temperature_Anomalies&VERSION=1.3.0&FORMAT=image/png&TRANSPARENT=true&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}'
                ],
                'tileSize': 256
            });

            map.addLayer({
                'id': 'seasurfaceanomaly',
                'type': 'raster',
                'source': 'seasurfaceanomaly',
                'paint': { 'raster-opacity': 0.85 },
            });

            map.setLayoutProperty('seasurfaceanomaly', 'visibility', 'visible');
            const togglePlayPause = () => {
                setIsPlaying(!isPlaying);
                if (!isPlaying) {
                    userInteracting.current = false;
                }
            };
            
            // Add play/pause button to the map
            const playPauseButton = document.createElement('button');
            playPauseButton.className = 'mapboxgl-ctrl-icon mapboxgl-ctrl-play-pause';
            playPauseButton.type = 'button';
            playPauseButton.onclick = togglePlayPause;
            playPauseButton.innerHTML = ReactDOMServer.renderToString(isPlaying ? <FaPause /> : <FaPlay />);

            const playPauseControl = document.createElement('div');
            playPauseControl.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
            playPauseControl.appendChild(playPauseButton);

            map.addControl({
                onAdd: () => playPauseControl,
                onRemove: () => playPauseControl.parentNode.removeChild(playPauseControl)
            }, 'top-right');
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

    return (
        <>
            <Container fluid className=''>
                <Row className='px-2'>
                    <Col md={9} className='px-3'>
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
                                <h5 className='mt-0 text-center mx-3 px-3 title'>Sea Surface Temperature Anomaly</h5>
                            </div>
                            <div className="position-absolute bottom-0 start-50 translate-middle-x mb-1"
                                style={{
                                    zIndex: 1000,
                                    border: '3px solid #000',
                                    borderRadius: '5px',
                                    pointerEvents: 'none'
                                }}>
                                <Image src={image} alt='Sea Surface Temp' width={300}  />
                            </div>
                        </div>
                    </Col>
                    <Col md={3} className='px-1'>
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

export default SeaSurfaceTempAnamoly;
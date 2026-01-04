import React, { memo, useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import MapCallback from './MapCallback';
import CameraMarker from './CameraMarker';
import L from 'leaflet';

// Memoized component to prevent re-renders when Lightbox opens/closes in App
const CameraMap = memo(({ cameras, selectedCamera, flyToCamera, onCameraSelect, onLightboxOpen }) => {
    // Default center: approx center of Czechia - adjusted for full width display
    const defaultPosition = [49.75, 15.3];
    const defaultZoom = 8; // Zoom 8 shows entire CZ on wide screens

    // Memoize cluster icon function to prevent recreation
    const iconCreateFunction = useMemo(() => (cluster) => {
        const markers = cluster.getAllChildMarkers();
        const count = markers.length;

        const firstIconHtml = markers[0].getIcon().options.html;
        const match = firstIconHtml.match(/url\('([^']+)'\)/);
        const thumbUrl = match ? match[1] : '';

        return L.divIcon({
            className: 'custom-cluster-icon',
            html: `
                <div style="
                    width: 60px;
                    height: 60px;
                    background-image: url('${thumbUrl}');
                    background-size: cover;
                    background-position: center;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 3px 8px rgba(0,0,0,0.6);
                    position: relative;
                    background-color: #ccc;
                ">
                    <div style="
                        position: absolute;
                        bottom: -5px;
                        right: -5px;
                        background: #f44336;
                        color: white;
                        width: 24px;
                        height: 24px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 12px;
                        font-weight: bold;
                        border: 2px solid white;
                    ">${count}</div>
                </div>
            `,
            iconSize: [60, 60],
            iconAnchor: [30, 30],
        });
    }, []);

    return (
        <MapContainer center={defaultPosition} zoom={defaultZoom} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapCallback selectedCamera={selectedCamera} shouldFly={flyToCamera} />

            <MarkerClusterGroup
                chunkedLoading
                spiderfyOnMaxZoom={true}
                showCoverageOnHover={false}
                maxClusterRadius={40}
                iconCreateFunction={iconCreateFunction}
            >
                {cameras.map(cam => (
                    <CameraMarker
                        key={cam.id}
                        cam={cam}
                        isSelected={selectedCamera && selectedCamera.id === cam.id}
                        onSelect={onLightboxOpen}
                    />
                ))}
            </MarkerClusterGroup>
        </MapContainer>
    );
});

export default CameraMap;

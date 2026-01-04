import { useMap } from 'react-leaflet';
import { useEffect } from 'react';

const MapCallback = ({ selectedCamera, shouldFly }) => {
    const map = useMap();

    useEffect(() => {
        if (selectedCamera && shouldFly) {
            const currentZoom = map.getZoom();
            // Only zoom in by 2 levels, capped at 14
            const targetZoom = Math.min(currentZoom + 2, 14);

            map.flyTo([selectedCamera.lat, selectedCamera.lon], targetZoom, {
                animate: true,
                duration: 1.0
            });
        }
    }, [selectedCamera, shouldFly, map]);

    return null;
};

export default MapCallback;

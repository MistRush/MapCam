import React, { memo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { getImageUrl, getThumbnailUrl } from '../api/chmi';
import { getRegionName } from '../utils/regions';
import L from 'leaflet';

// Define createCustomIcon here or import it if you extracted it. 
// Since it was inside CameraMap before, we'll redefine it here to be independent.
const createCustomIconLocal = (cam, isSelected) => {
    const thumbUrl = getThumbnailUrl(cam.id);

    // CSS styles for the marker
    const size = isSelected ? 80 : 50;
    const border = isSelected ? '3px solid #f44336' : '2px solid white';

    return L.divIcon({
        className: 'custom-camera-icon',
        html: `
            <div style="
                width: ${size}px;
                height: ${size}px;
                background-image: url('${thumbUrl}');
                background-size: cover;
                background-position: center;
                border-radius: 50%;
                border: ${border};
                box-shadow: 0 2px 5px rgba(0,0,0,0.5);
                background-color: #ccc;
                display: flex;
                transition: all 0.2s ease-out;
            "></div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2],
    });
};

const CameraMarker = memo(({ cam, isSelected, onSelect }) => {
    return (
        <Marker
            position={[cam.lat, cam.lon]}
            icon={createCustomIconLocal(cam, isSelected)}
            eventHandlers={{
                // No click handler to move map/select camera immediately.
                // Selection happens via Lightbox open.
            }}
        >
            <Popup>
                <div style={{ minWidth: '220px', textAlign: 'center' }}>
                    <strong style={{ fontSize: '1.1em' }}>{cam.name}</strong><br />
                    <span style={{ color: '#666', fontSize: '0.9em' }}>{getRegionName(cam.region)} | {cam.altitude}m</span><br />
                    <hr style={{ margin: '8px 0', border: '0', borderTop: '1px solid #eee' }} />
                    <div
                        onClick={() => onSelect(cam)}
                        style={{ cursor: 'pointer', display: 'block', minHeight: '150px' }}
                        title="Kliknutím zvětšíte"
                    >
                        <img
                            src={getImageUrl(cam.id)}
                            alt={cam.name}
                            style={{ width: '100%', height: 'auto', borderRadius: '4px', display: 'block' }}
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/200x150?text=Načítám...'; }}
                        />
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '0.85em', color: '#666' }}>
                        Kliknutím zvětšíte
                    </div>
                </div>
            </Popup>
        </Marker>
    );
}, (prevProps, nextProps) => {
    // Custom comparison to prevent re-renders
    return (
        prevProps.cam.id === nextProps.cam.id &&
        prevProps.isSelected === nextProps.isSelected
        // We ignore onSelect assuming it's stable or we don't care about it changing
    );
});

export default CameraMarker;

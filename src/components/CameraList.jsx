import React, { useState, useEffect, useMemo } from 'react';
import './CameraList.css';
import { getRegionName } from '../utils/regions';
import { calculateDistance, formatDistance } from '../utils/geo';
import { getImageUrl } from '../api/chmi';

const CameraList = ({
    cameras,
    onSelect,
    selectedCamera,
    viewMode,
    userLocation,
    isLocating,
    onLightboxOpen
}) => {
    const [searchTerm, setSearchTerm] = useState("");

    // Calculate distances and sort if in 'nearest' mode
    const processedCameras = useMemo(() => {
        let cams = [...cameras];

        // 1. Calculate distances if location is available
        if (userLocation) {
            cams = cams.map(cam => ({
                ...cam,
                distance: calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    cam.lat,
                    cam.lon
                )
            }));
        }

        // 2. Filter by search term
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            cams = cams.filter(cam =>
                (cam.name && cam.name.toLowerCase().includes(searchLower)) ||
                (cam.region && getRegionName(cam.region).toLowerCase().includes(searchLower))
            );
        }

        // 3. Sort by distance if in 'nearest' mode and location exists
        if (viewMode === 'nearest' && userLocation) {
            cams.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
            // Limit to top 50 in nearest mode to save performance/bandwidth on images
            // But only if there is no search term (if searching, we want to scan all)
            if (!searchTerm) {
                return cams.slice(0, 12);
            }
        }

        return cams;
    }, [cameras, userLocation, searchTerm, viewMode]);

    const isGrid = viewMode === 'nearest';

    return (
        <div className="camera-list-container">
            <input
                type="text"
                placeholder="Hledat kameru nebo kraj..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {isLocating && viewMode === 'nearest' && (
                <div className="status-message">Zjišťuji vaši polohu...</div>
            )}

            {!isLocating && viewMode === 'nearest' && !userLocation && (
                <div className="status-message error">
                    Poloha není k dispozici. Povolte přístup k poloze pro zobrazení nejbližších kamer.
                </div>
            )}

            <div className={`camera-list ${isGrid ? 'grid-view' : 'list-view'}`}>
                {processedCameras.map((cam) => (
                    <div
                        key={cam.id}
                        className={`camera-item ${selectedCamera && selectedCamera.id === cam.id ? 'active' : ''} ${isGrid ? 'grid-item' : ''}`}
                        onClick={() => {
                            if (isGrid && onLightboxOpen) {
                                onLightboxOpen(cam);
                            } else {
                                onSelect(cam);
                            }
                        }}
                    >
                        {isGrid && (
                            <div className="camera-thumbnail">
                                <img
                                    src={getImageUrl(cam.id)}
                                    alt={cam.name}
                                    loading="lazy"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                                <div className="distance-badge">
                                    {formatDistance(cam.distance)}
                                </div>
                            </div>
                        )}

                        <div className="camera-info">
                            <span className="camera-name">{cam.name}</span>
                            <span className="camera-details">
                                {isGrid ? '' : getRegionName(cam.region) + ' • '}
                                {!isGrid && cam.altitude && `${cam.altitude} m n. m.`}
                                {!isGrid && cam.distance && ` • ${formatDistance(cam.distance)}`}
                            </span>
                        </div>
                    </div>
                ))}
                {processedCameras.length === 0 && (
                    <div className="no-results">Žádné kamery nenalezeny.</div>
                )}
            </div>
        </div>
    );
};

export default CameraList;

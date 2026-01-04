import React, { useState } from 'react';
import './CameraList.css';
import { getRegionName } from '../utils/regions';

const CameraList = ({ cameras, onSelect, selectedCamera }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredCameras = cameras.filter(cam => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (cam.name && cam.name.toLowerCase().includes(searchLower)) ||
            (cam.region && getRegionName(cam.region).toLowerCase().includes(searchLower)) // Search in full name too
        );
    });

    return (
        <div className="camera-list-container">
            <input
                type="text"
                placeholder="Hledat kameru nebo kraj..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="camera-list">
                {filteredCameras.map((cam) => (
                    <div
                        key={cam.id}
                        className={`camera-item ${selectedCamera && selectedCamera.id === cam.id ? 'active' : ''}`}
                        onClick={() => onSelect(cam)}
                    >
                        <div className="camera-info">
                            <span className="camera-name">{cam.name}</span>
                            <span className="camera-details">
                                {getRegionName(cam.region)} • {cam.altitude} m n. m.
                            </span>
                        </div>
                    </div>
                ))}
                {filteredCameras.length === 0 && (
                    <div className="no-results">Žádné kamery nenalezeny.</div>
                )}
            </div>
        </div>
    );
};

export default CameraList;

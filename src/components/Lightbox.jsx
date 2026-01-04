import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Lightbox.css';
import { getRegionName } from '../utils/regions';
import { fetchHistoricalTimestamps, getHistoricalImageUrl, getImageUrl } from '../api/chmi';

const Lightbox = ({ camera, onClose }) => {
    const [history, setHistory] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentImageSrc, setCurrentImageSrc] = useState(null);
    const [imageCache, setImageCache] = useState({});
    const timerRef = useRef(null);
    const abortControllerRef = useRef(null);

    // Fetch a historical image and return base64 data URL
    const fetchHistoricalImage = useCallback(async (cameraId, item) => {
        const url = getHistoricalImageUrl(cameraId, item);
        const cacheKey = url;

        // Return cached image if available
        if (imageCache[cacheKey]) {
            return imageCache[cacheKey];
        }

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch image');

            const contentType = response.headers.get('content-type');

            if (contentType && contentType.includes('application/json')) {
                // API returns JSON with base64 image
                const json = await response.json();
                if (json.image) {
                    // Format: "image/jpeg;base64,/9j/4AAQ..."
                    const dataUrl = json.image.startsWith('data:')
                        ? json.image
                        : `data:${json.image}`;

                    // Cache the image
                    setImageCache(prev => ({ ...prev, [cacheKey]: dataUrl }));
                    return dataUrl;
                }
            } else {
                // Direct binary image - create blob URL
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                setImageCache(prev => ({ ...prev, [cacheKey]: blobUrl }));
                return blobUrl;
            }
        } catch (error) {
            console.error('Error fetching historical image:', error);
            return null;
        }
        return null;
    }, [imageCache]);

    // Fetch historical timestamps when camera changes
    useEffect(() => {
        if (!camera) return;

        setIsLoading(true);
        setHistory([]);
        setCurrentIndex(0);
        setImageCache({});
        setCurrentImageSrc(null);

        fetchHistoricalTimestamps(camera.id)
            .then(imageData => {
                if (imageData && imageData.length > 0) {
                    // Data is already sorted chronologically by API (oldest first)
                    setHistory(imageData);
                    setCurrentIndex(imageData.length - 1); // Start at newest
                } else {
                    // Fallback to current image only
                    setHistory([]);
                }
            })
            .finally(() => setIsLoading(false));
    }, [camera]);

    // Load current image when index changes
    useEffect(() => {
        if (!camera) return;

        // Cancel previous fetch
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        const currentItem = history[currentIndex];

        if (currentItem) {
            // Fetch historical image
            fetchHistoricalImage(camera.id, currentItem).then(src => {
                if (src) setCurrentImageSrc(src);
            });
        } else if (history.length === 0 && !isLoading) {
            // No history, use current image URL directly
            setCurrentImageSrc(getImageUrl(camera.id));
        }
    }, [camera, currentIndex, history, isLoading, fetchHistoricalImage]);

    // Preload adjacent frames for smoother playback
    useEffect(() => {
        if (!camera || history.length <= 1) return;

        // Preload next 5 frames
        const preloadCount = 5;
        for (let i = 1; i <= preloadCount; i++) {
            const nextIndex = (currentIndex + i) % history.length;
            const item = history[nextIndex];
            if (item) {
                fetchHistoricalImage(camera.id, item);
            }
        }
    }, [camera, currentIndex, history, fetchHistoricalImage]);

    // Auto-play effect
    useEffect(() => {
        if (isPlaying && history.length > 1) {
            timerRef.current = setInterval(() => {
                setCurrentIndex(prev => {
                    if (prev >= history.length - 1) {
                        // Loop back to start
                        return 0;
                    }
                    return prev + 1;
                });
            }, 300); // 300ms per frame for smooth animation
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isPlaying, history.length]);

    if (!camera) return null;

    const currentItem = history[currentIndex];

    // Format timestamp for display
    const formatTime = (item) => {
        if (!item) return 'Aktuální';
        const dateStr = typeof item === 'object' ? item.dateTime : item;
        if (!dateStr) return 'Aktuální';
        try {
            const date = new Date(dateStr);
            return date.toLocaleString('cs-CZ', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateStr;
        }
    };

    // Closes lightbox when clicking outside the content
    const handleBackdropClick = (e) => {
        if (e.target.className === 'lightbox-overlay') {
            onClose();
        }
    };

    const handleSliderChange = (e) => {
        setCurrentIndex(parseInt(e.target.value, 10));
        setIsPlaying(false);
    };

    const handlePrevFrame = () => {
        setCurrentIndex(prev => Math.max(0, prev - 1));
        setIsPlaying(false);
    };

    const handleNextFrame = () => {
        setCurrentIndex(prev => Math.min(history.length - 1, prev + 1));
        setIsPlaying(false);
    };

    const handleGoToNewest = () => {
        setCurrentIndex(history.length - 1);
        setIsPlaying(false);
    };

    return (
        <div className="lightbox-overlay" onClick={handleBackdropClick}>
            <div className="lightbox-content">
                <button className="lightbox-close" onClick={onClose}>&times;</button>

                <h2 className="lightbox-title">{camera.name}</h2>
                <div className="lightbox-meta">
                    {getRegionName(camera.region)} | {camera.altitude} m n. m.
                </div>

                <div className="lightbox-image-container">
                    {isLoading ? (
                        <div className="lightbox-loading">Načítám historii...</div>
                    ) : !currentImageSrc ? (
                        <div className="lightbox-loading">Načítám snímek...</div>
                    ) : (
                        <img
                            src={currentImageSrc}
                            alt={`${camera.name} - ${formatTime(currentItem)}`}
                            key={currentIndex}
                        />
                    )}
                </div>

                {/* Timelapse Controls */}
                <div className="lightbox-controls">
                    <button
                        className="control-btn"
                        onClick={handlePrevFrame}
                        disabled={history.length <= 1 || currentIndex === 0}
                        title="Předchozí snímek"
                    >
                        ⏮
                    </button>

                    <button
                        className="control-btn play-btn"
                        onClick={() => setIsPlaying(!isPlaying)}
                        disabled={history.length <= 1}
                        title={history.length <= 1 ? "Historie není dostupná" : (isPlaying ? "Pozastavit" : "Přehrát")}
                    >
                        {isPlaying ? '⏸' : '▶'}
                    </button>

                    <button
                        className="control-btn"
                        onClick={handleNextFrame}
                        disabled={history.length <= 1 || currentIndex >= history.length - 1}
                        title="Další snímek"
                    >
                        ⏭
                    </button>

                    <div className="timeline-container">
                        <input
                            type="range"
                            min="0"
                            max={Math.max(0, history.length - 1)}
                            value={currentIndex}
                            onChange={handleSliderChange}
                            disabled={history.length <= 1}
                            className="timeline-slider"
                        />
                    </div>

                    <button
                        className="control-btn"
                        onClick={handleGoToNewest}
                        disabled={history.length <= 1 || currentIndex >= history.length - 1}
                        title="Aktuální snímek"
                    >
                        ⏩
                    </button>
                </div>

                <div className="frame-info">
                    {history.length > 0 ? (
                        <>
                            <span className="frame-time">{formatTime(currentItem)}</span>
                            <span className="frame-count">
                                {currentIndex + 1} / {history.length}
                            </span>
                        </>
                    ) : (
                        <span className="frame-time">Aktuální snímek</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Lightbox;

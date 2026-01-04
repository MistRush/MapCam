/**
 * API service for fetching ČHMÚ camera data.
 */

// We use a local copy of the metadata because the live API is CORS-protected for browser access
// and redirects unpredictably. The 'webcams.json' is stored in the public folder.
const DATA_URL = '/webcams.json';

export const fetchCameras = async () => {
    try {
        const response = await fetch(DATA_URL);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
        }
        const data = await response.json();

        // The downloaded content is an Array.
        const list = Array.isArray(data) ? data : Object.values(data);

        return list.map(cam => ({
            id: cam.file,
            name: cam.name,
            lat: parseFloat(cam.lat),
            lon: parseFloat(cam.lon),
            region: cam.kraj,
            altitude: cam.vyska
        }));
    } catch (error) {
        console.error("Failed to fetch cameras:", error);
        return [];
    }
};

export const getImageUrl = (id) => {
    return `https://intranet.chmi.cz/files/portal/docs/meteo/kam/${id}.jpg`;
};

export const getThumbnailUrl = (id) => {
    // Thumbnails are usually in /thumbs/ subdirectory as .gif
    // Based on previous research: https://intranet.chmi.cz/files/portal/docs/meteo/kam/thumbs/{file}.gif
    return `https://intranet.chmi.cz/files/portal/docs/meteo/kam/thumbs/${id}.gif`;
};

/**
 * Fetches available historical images for a camera.
 * Returns an array of image objects with dateTime and imageUrl.
 */
export const fetchHistoricalTimestamps = async (cameraId) => {
    try {
        // Use proxy in development to avoid CORS
        const response = await fetch(
            `/api/history/${cameraId}`
        );
        if (!response.ok) {
            throw new Error(`Failed to fetch history: ${response.status}`);
        }
        const json = await response.json();
        // The API returns { data: [...], ... }
        if (json.data && Array.isArray(json.data)) {
            // Return full objects with dateTime and imageUrl
            return json.data;
        }
        return [];
    } catch (error) {
        console.error(`Failed to fetch historical timestamps for ${cameraId}:`, error);
        return [];
    }
};

/**
 * Gets the URL for a historical image.
 * Uses the imageUrl directly from API response (via proxy).
 */
export const getHistoricalImageUrl = (cameraId, imageData) => {
    // imageData can be the full object with imageUrl, or just a timestamp string
    if (typeof imageData === 'object' && imageData.imageUrl) {
        // Use proxy to avoid CORS
        return `/api/image/${cameraId}/${encodeURIComponent(imageData.dateTime)}`;
    }
    // Fallback for direct timestamp
    return `/api/image/${cameraId}/${encodeURIComponent(imageData)}`;
};

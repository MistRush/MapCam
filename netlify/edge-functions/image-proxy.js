// Netlify Edge Function to proxy ČHMÚ historical image API
// This bypasses CORS by making the request server-side

export default async (request, context) => {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/api/image/');

    if (pathParts.length < 2) {
        return new Response('Invalid request', { status: 400 });
    }

    // Path should be: cameraId/timestamp
    const imagePath = pathParts[1];
    const targetUrl = `https://data-provider.chmi.cz/api/kamery/data/obrazok/${imagePath}`;

    try {
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'Accept': 'image/jpeg,image/*',
                'Origin': 'https://portal.chmi.cz',
                'Referer': 'https://portal.chmi.cz/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            return new Response(`Upstream error: ${response.status}`, {
                status: response.status
            });
        }

        const imageBuffer = await response.arrayBuffer();

        return new Response(imageBuffer, {
            status: 200,
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=3600'
            }
        });
    } catch (error) {
        return new Response(`Error: ${error.message}`, { status: 500 });
    }
};

export const config = {
    path: '/api/image/*'
};

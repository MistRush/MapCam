// Netlify Edge Function to proxy ČHMÚ historical data API
// This bypasses CORS by making the request server-side

export default async (request, context) => {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/api/history/');

    if (pathParts.length < 2) {
        return new Response('Invalid request', { status: 400 });
    }

    const cameraId = pathParts[1];
    const targetUrl = `https://data-provider.chmi.cz/api/playableImages/init/web-kamery/${cameraId}`;

    try {
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
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

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=60'
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export const config = {
    path: '/api/history/*'
};

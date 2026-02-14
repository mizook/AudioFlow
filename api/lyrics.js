module.exports = async function handler(req, res) {
    const { q } = req.query;

    // Set CORS headers to allow requests from any origin (or unrestricted)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (!q) {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const GENIUS_ACCESS_TOKEN = process.env.VITE_GENIUS_ACCESS_TOKEN || process.env.GENIUS_ACCESS_TOKEN;

    if (!GENIUS_ACCESS_TOKEN) {
        console.error("[Serverless] CRITICAL: GENIUS_ACCESS_TOKEN is missing.");
        return res.status(500).json({
            error: 'Configuration Error',
            details: 'GENIUS_ACCESS_TOKEN is missing in Vercel Environment Variables.'
        });
    }

    try {
        console.log(`[Serverless] Searching Genius for: ${q}`);

        // 1. Search for the song in Genius API using native fetch
        const searchUrl = `https://api.genius.com/search?q=${encodeURIComponent(q)}`;
        const searchResponse = await fetch(searchUrl, {
            headers: {
                'Authorization': `Bearer ${GENIUS_ACCESS_TOKEN}`
            }
        });

        if (!searchResponse.ok) {
            const errText = await searchResponse.text();
            throw new Error(`Genius API responded with ${searchResponse.status}: ${errText}`);
        }

        const searchData = await searchResponse.json();
        const hits = searchData.response.hits;

        if (!hits || hits.length === 0) {
            return res.status(404).json({ error: 'No songs found' });
        }

        // Get the first result's URL
        const songPath = hits[0].result.path;
        const songUrl = `https://genius.com${songPath}`;
        console.log(`[Serverless] Found song URL: ${songUrl}`);

        // 2. Scrape the lyrics page
        const pageResponse = await fetch(songUrl);
        if (!pageResponse.ok) {
            throw new Error(`Failed to fetch song page: ${pageResponse.status}`);
        }
        const html = await pageResponse.text();

        // 3. Extract lyrics using Regex (Zero Dependency)
        // Look for content inside data-lyrics-container="true"
        // Pattern: <div data-lyrics-container="true" ...>(content)</div>
        // We need to handle nested tags like <br>, <i>, <a> etc.

        let lyrics = '';

        // Simple regex to find the container contents
        // Note: This is less robust than cheerio but works for standard Genius pages implies we clean tags later
        const containerRegex = /data-lyrics-container="true"[^>]*>([\s\S]*?)<\/div>/g;
        let match;

        while ((match = containerRegex.exec(html)) !== null) {
            let content = match[1];
            // Replace <br> with newlines
            content = content.replace(/<br\s*\/?>/gi, '\n');
            // Remove all other HTML tags
            content = content.replace(/<[^>]*>/g, '');
            // Decode HTML entities (basic ones)
            content = content.replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#x27;/g, "'");

            lyrics += content + '\n';
        }

        if (!lyrics.trim()) {
            // Fallback: Try regex for class "Lyrics__Container"
            const fallbackRegex = /class="[^"]*Lyrics__Container[^"]*"[^>]*>([\s\S]*?)<\/div>/g;
            while ((match = fallbackRegex.exec(html)) !== null) {
                let content = match[1];
                content = content.replace(/<br\s*\/?>/gi, '\n');
                content = content.replace(/<[^>]*>/g, '');
                lyrics += content + '\n';
            }
        }

        if (!lyrics.trim()) {
            console.error("[Serverless] Lyrics content empty after regex parsing.");
            return res.status(404).json({ error: 'Lyrics content not found on page' });
        }

        // Clean up
        lyrics = lyrics.replace(/\[.*?\]/g, '').trim();
        lyrics = lyrics.replace(/\n{3,}/g, '\n\n').trim();

        console.log("[Serverless] Lyrics extracted successfully");
        return res.status(200).json({ lyrics, source: 'Genius via Vercel (Regex)' });

    } catch (error) {
        console.error('[Serverless] Handler Error:', error.message);
        return res.status(500).json({
            error: 'Internal Server Error',
            details: error.message
        });
    }
};

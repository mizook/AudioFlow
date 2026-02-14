const cheerio = require('cheerio');

module.exports = async function handler(req, res) {
    const { q } = req.query;

    // Set CORS headers
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

    const axios = require('axios');

    try {
        console.log(`[Serverless] Searching Genius for: ${q}`);

        // 1. Search for the song
        const searchUrl = 'https://api.genius.com/search';

        const searchResponse = await axios.get(searchUrl, {
            params: { q },
            timeout: 12000,
            headers: {
                'Authorization': `Bearer ${GENIUS_ACCESS_TOKEN}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const hits = searchResponse.data.response.hits;

        if (!hits || hits.length === 0) {
            return res.status(404).json({ error: 'No songs found' });
        }

        const songPath = hits[0].result.path;
        const songUrl = `https://genius.com${songPath}`;
        console.log(`[Serverless] Found song URL: ${songUrl}`);

        // 2. Fetch the lyrics page
        const pageResponse = await axios.get(songUrl, {
            timeout: 12000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const html = pageResponse.data;

        // 3. Extract lyrics using Cheerio
        const $ = cheerio.load(html);

        // Genius stores lyrics in containers with data-lyrics-container="true"
        // or sometimes in a div with class starting with Lyrics__Container
        let lyrics = '';

        // Remove script tags and style tags just in case
        $('script').remove();
        $('style').remove();

        // Option A: data-lyrics-container="true"
        const containers = $('[data-lyrics-container="true"]');

        if (containers.length > 0) {
            containers.each((i, el) => {
                // Replace <br> with newlines
                $(el).find('br').replaceWith('\n');
                lyrics += $(el).text() + '\n';
            });
        } else {
            // Option B: Fallback to Lyrics__Container class
            const fallbackContainers = $('div[class^="Lyrics__Container"]');
            if (fallbackContainers.length > 0) {
                fallbackContainers.each((i, el) => {
                    $(el).find('br').replaceWith('\n');
                    lyrics += $(el).text() + '\n';
                });
            }
        }

        if (!lyrics.trim()) {
            return res.status(404).json({ error: 'Lyrics content not found on page' });
        }

        // querySelectorAll in Cheerio is $(...)
        // We already extracted text.

        // Clean up
        lyrics = lyrics.trim();
        // Ensure no more than 2 newlines
        lyrics = lyrics.replace(/\n{3,}/g, '\n\n');

        console.log("[Serverless] Lyrics extracted successfully (Cheerio)");
        return res.status(200).json({ lyrics, source: 'Genius via Vercel (Cheerio)' });

    } catch (error) {
        const status = error?.response?.status || 500;
        const details = error?.response?.data?.meta?.message || error?.response?.data?.error_description || error.message;
        console.error('[Serverless] Handler Error:', details);
        return res.status(500).json({
            error: 'Internal Server Error',
            details,
            status
        });
    }
};

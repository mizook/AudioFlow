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

    try {
        console.log(`[Serverless] Searching Genius for: ${q}`);

        // 1. Search for the song
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

        const songPath = hits[0].result.path;
        const songUrl = `https://genius.com${songPath}`;
        console.log(`[Serverless] Found song URL: ${songUrl}`);

        // 2. Fetch the lyrics page
        const pageResponse = await fetch(songUrl);
        if (!pageResponse.ok) {
            throw new Error(`Failed to fetch song page: ${pageResponse.status}`);
        }
        const html = await pageResponse.text();

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
        console.error('[Serverless] Handler Error:', error.message);
        return res.status(500).json({
            error: 'Internal Server Error',
            details: error.message
        });
    }
};

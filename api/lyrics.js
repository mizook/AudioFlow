// Remove axios dependency to reduce failure surface
const cheerio = require('cheerio');

module.exports = async function handler(req, res) {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const GENIUS_ACCESS_TOKEN = process.env.VITE_GENIUS_ACCESS_TOKEN || process.env.GENIUS_ACCESS_TOKEN;

    if (!GENIUS_ACCESS_TOKEN) {
        console.error("CRITICAL: GENIUS_ACCESS_TOKEN is missing in environment variables.");
        return res.status(500).json({
            error: 'Configuration Error',
            details: 'GENIUS_ACCESS_TOKEN is missing. Please add it to Vercel Environment Variables.'
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
            console.error(`[Serverless] Genius API Error (${searchResponse.status}):`, errText);
            throw new Error(`Genius API responded with ${searchResponse.status}: ${errText}`);
        }

        const searchData = await searchResponse.json();
        const hits = searchData.response.hits;

        if (!hits || hits.length === 0) {
            console.log("[Serverless] No hits found on Genius API");
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
        const $ = cheerio.load(html);

        // 3. Extract lyrics
        let lyrics = '';

        // Clean up <br> tags first
        $('br').replaceWith('\n');

        // Selectors used by Genius
        const selectors = ['[data-lyrics-container="true"]', '.lyrics', '.Lyrics__Container-sc-1ynbvzw-5'];

        selectors.forEach(selector => {
            $(selector).each((i, el) => {
                lyrics += $(el).text() + '\n';
            });
        });

        // Fallback extraction
        if (!lyrics.trim()) {
            $('div[class*="Lyrics__Container"]').each((i, el) => {
                lyrics += $(el).text() + '\n';
            });
        }

        if (!lyrics.trim()) {
            console.error("[Serverless] Lyrics content empty after parsing.");
            return res.status(404).json({ error: 'Lyrics content not found on page' });
        }

        // Clean up lyrics
        lyrics = lyrics.replace(/\[.*?\]/g, '').trim();
        lyrics = lyrics.replace(/\n{3,}/g, '\n\n').trim();

        console.log("[Serverless] Lyrics extracted successfully");
        return res.status(200).json({ lyrics, source: 'Genius via Vercel' });

    } catch (error) {
        console.error('[Serverless] Handler Error:', error.message);
        return res.status(500).json({
            error: 'Internal Server Error',
            details: error.message
        });
    }
};

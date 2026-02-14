const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async function handler(req, res) {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const GENIUS_ACCESS_TOKEN = process.env.VITE_GENIUS_ACCESS_TOKEN || process.env.GENIUS_ACCESS_TOKEN;

    if (!GENIUS_ACCESS_TOKEN) {
        console.error("GENIUS_ACCESS_TOKEN is missing in environment variables.");
        return res.status(500).json({ error: 'GENIUS_ACCESS_TOKEN is not configured' });
    }

    try {
        console.log(`Searching Genius for: ${q}`);

        // 1. Search for the song in Genius API
        const searchUrl = `https://api.genius.com/search?q=${encodeURIComponent(q)}`;
        const searchResponse = await axios.get(searchUrl, {
            headers: {
                Authorization: `Bearer ${GENIUS_ACCESS_TOKEN}`,
            },
        });

        const hits = searchResponse.data.response.hits;
        if (!hits || hits.length === 0) {
            console.log("No hits found on Genius API");
            return res.status(404).json({ error: 'No songs found' });
        }

        // Get the first result's URL
        const songPath = hits[0].result.path;
        const songUrl = `https://genius.com${songPath}`;
        console.log(`Found song URL: ${songUrl}`);

        // 2. Scrape the lyrics page
        const pageResponse = await axios.get(songUrl);
        const html = pageResponse.data;
        const $ = cheerio.load(html);

        // 3. Extract lyrics
        let lyrics = '';

        // Selectors used by Genius
        const selectors = ['[data-lyrics-container="true"]', '.lyrics', '.Lyrics__Container-sc-1ynbvzw-5'];

        selectors.forEach(selector => {
            $(selector).each((i, el) => {
                // Replace <br> with newlines
                $(el).find('br').replaceWith('\n');
                lyrics += $(el).text() + '\n';
            });
        });

        // Fallback extraction
        if (!lyrics.trim()) {
            $('div[class*="Lyrics__Container"]').each((i, el) => {
                $(el).find('br').replaceWith('\n');
                lyrics += $(el).text() + '\n';
            });
        }

        if (!lyrics.trim()) {
            console.error("Lyrics content empty after parsing.");
            return res.status(404).json({ error: 'Lyrics content not found on page' });
        }

        // Clean up lyrics
        lyrics = lyrics.replace(/\[.*?\]/g, '').trim();
        lyrics = lyrics.replace(/\n{3,}/g, '\n\n').trim();

        console.log("Lyrics extracted successfully");
        return res.status(200).json({ lyrics, source: 'Genius via Vercel' });

    } catch (error) {
        console.error('Error fetching lyrics:', error.message);
        if (error.response) {
            console.error('API Response:', error.response.data);
        }
        return res.status(500).json({ error: 'Failed to fetch lyrics', details: error.message });
    }
};

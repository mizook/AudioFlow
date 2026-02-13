import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const GENIUS_ACCESS_TOKEN = process.env.VITE_GENIUS_ACCESS_TOKEN || process.env.GENIUS_ACCESS_TOKEN;

    if (!GENIUS_ACCESS_TOKEN) {
        return res.status(500).json({ error: 'GENIUS_ACCESS_TOKEN is not configured' });
    }

    try {
        // 1. Search for the song in Genius API
        const searchUrl = `https://api.genius.com/search?q=${encodeURIComponent(q)}`;
        const searchResponse = await axios.get(searchUrl, {
            headers: {
                Authorization: `Bearer ${GENIUS_ACCESS_TOKEN}`,
            },
        });

        const hits = searchResponse.data.response.hits;
        if (!hits || hits.length === 0) {
            return res.status(404).json({ error: 'No songs found' });
        }

        // Get the first result's URL
        const songPath = hits[0].result.path;
        const songUrl = `https://genius.com${songPath}`;

        // 2. Scrape the lyrics page
        const pageResponse = await axios.get(songUrl);
        const html = pageResponse.data;
        const $ = cheerio.load(html);

        // 3. Extract lyrics (Selectors might change, so we try multiple known ones)
        let lyrics = '';

        // Selectors used by Genius
        const selectors = ['[dataset-lyrics-container="true"]', '.lyrics', '.Lyrics__Container-sc-1ynbvzw-5'];

        selectors.forEach(selector => {
            $(selector).each((i, el) => {
                // Replace <br> with newlines
                $(el).find('br').replaceWith('\n');
                lyrics += $(el).text() + '\n';
            });
        });

        if (!lyrics.trim()) {
            // Fallback: Try to get just raw text from containers if specific structure changes
            $('[class*="Lyrics__Container"]').each((i, el) => {
                $(el).find('br').replaceWith('\n');
                lyrics += $(el).text() + '\n';
            });
        }

        if (!lyrics.trim()) {
            return res.status(404).json({ error: 'Lyrics content not found on page' });
        }

        // Clean up lyrics
        lyrics = lyrics.replace(/\[.*?\]/g, '').trim(); // Remove [Chorus], [Verse], etc. if desired, currently keeping them might be better for structure but user asked for cleanup before? 
        // Actually, keeping [Verse] markers is usually good for structure, but sometimes they are messy.
        // Let's keep them but ensure clean spacing.
        // The previous implementation kept them. I will return raw text.

        // Cleaning extra newlines
        lyrics = lyrics.replace(/\n{3,}/g, '\n\n').trim();

        return res.status(200).json({ lyrics, source: 'Genius via Vercel' });

    } catch (error) {
        console.error('Error fetching lyrics:', error);
        return res.status(500).json({ error: 'Failed to fetch lyrics', details: error.message });
    }
}

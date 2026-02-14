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

    const rawToken = process.env.GENIUS_ACCESS_TOKEN || process.env.VITE_GENIUS_ACCESS_TOKEN;
    const GENIUS_ACCESS_TOKEN = rawToken
        ? rawToken.replace(/^Bearer\s+/i, '').trim()
        : '';

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

        let searchResponse;
        try {
            searchResponse = await axios.get(searchUrl, {
                params: { q },
                timeout: 12000,
                headers: {
                    'Authorization': `Bearer ${GENIUS_ACCESS_TOKEN}`,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
        } catch (searchError) {
            const searchStatus = searchError?.response?.status || 500;
            const searchDetails = searchError?.response?.data?.meta?.message || searchError?.response?.data?.error_description || searchError.message;
            const isSearchAuthError = searchStatus === 401 || searchStatus === 403;

            return res.status(isSearchAuthError ? 502 : 500).json({
                error: isSearchAuthError ? 'Genius Authentication Error' : 'Genius Search Error',
                details: isSearchAuthError
                    ? `${searchDetails}. Revisa GENIUS_ACCESS_TOKEN en Vercel (entorno Production).`
                    : searchDetails,
                status: searchStatus,
                stage: 'genius-search'
            });
        }

        const hits = searchResponse.data.response.hits;

        if (!hits || hits.length === 0) {
            return res.status(404).json({ error: 'No songs found' });
        }

        const songPath = hits[0].result.path;
        const songTitle = hits[0].result.title;
        const songArtist = hits[0].result.primary_artist?.name;
        const songUrl = `https://genius.com${songPath}`;
        console.log(`[Serverless] Found song URL: ${songUrl}`);

        // 2. Fetch the lyrics page
        let html = '';
        try {
            const pageResponse = await axios.get(songUrl, {
                timeout: 12000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            html = pageResponse.data;
        } catch (pageError) {
            const pageStatus = pageError?.response?.status || 500;
            const pageDetails = pageError?.response?.data?.meta?.message || pageError?.response?.data?.error_description || pageError.message;

            // Fallback provider when Genius blocks HTML requests from serverless IPs.
            if (songArtist && songTitle) {
                try {
                    const fallbackResponse = await axios.get(
                        `https://api.lyrics.ovh/v1/${encodeURIComponent(songArtist)}/${encodeURIComponent(songTitle)}`,
                        { timeout: 10000 }
                    );

                    const fallbackLyrics = fallbackResponse?.data?.lyrics?.trim();
                    if (fallbackLyrics) {
                        return res.status(200).json({
                            lyrics: fallbackLyrics.replace(/\n{3,}/g, '\n\n'),
                            source: 'lyrics.ovh fallback',
                            fallback: true,
                            originalStageError: {
                                stage: 'genius-page-fetch',
                                status: pageStatus,
                                details: pageDetails
                            }
                        });
                    }
                } catch (fallbackError) {
                    console.error('[Serverless] Fallback lyrics provider error:', fallbackError.message);
                }
            }

            return res.status(502).json({
                error: 'Genius Page Fetch Blocked',
                details: `La búsqueda en Genius funcionó, pero la página de letras devolvió ${pageStatus} (${pageDetails}).`,
                status: pageStatus,
                stage: 'genius-page-fetch'
            });
        }

        const { load } = await import('cheerio');

        // 3. Extract lyrics using Cheerio
        const $ = load(html);

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
            if (songArtist && songTitle) {
                try {
                    const fallbackResponse = await axios.get(
                        `https://api.lyrics.ovh/v1/${encodeURIComponent(songArtist)}/${encodeURIComponent(songTitle)}`,
                        { timeout: 10000 }
                    );

                    const fallbackLyrics = fallbackResponse?.data?.lyrics?.trim();
                    if (fallbackLyrics) {
                        return res.status(200).json({
                            lyrics: fallbackLyrics.replace(/\n{3,}/g, '\n\n'),
                            source: 'lyrics.ovh fallback',
                            fallback: true
                        });
                    }
                } catch (fallbackError) {
                    console.error('[Serverless] Fallback lyrics provider error:', fallbackError.message);
                }
            }

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

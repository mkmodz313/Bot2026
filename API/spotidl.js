const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ status: 400, error: 'Missing search query!' });

  try {
    // API call same as bot plugin
    const apiUrl = `https://okatsu-rolezapiiz.vercel.app/search/spotify?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(apiUrl, { 
      timeout: 20000, 
      headers: { 'User-Agent': 'Mozilla/5.0' } 
    });

    if (!data?.status || !data?.result || !data.result.audio) {
      return res.status(404).json({ status: 404, error: 'No audio found for this query.' });
    }

    const r = data.result;

    res.json({
      status: 200,
      title: r.title || r.name || 'Unknown Title',
      artist: r.artist || 'Unknown Artist',
      duration: r.duration || 'Unknown',
      url: r.url || '',
      audio: r.audio || '',
      thumbnail: r.thumbnails || null
    });

  } catch (err) {
    console.error('Spotify API Error:', err.message);
    res.status(500).json({ status: 500, error: 'Failed to fetch Spotify audio. Try again later.' });
  }
});

module.exports = router;

const express = require('express');
const axios = require('axios');
const router = express.Router();

const AXIOS_DEFAULTS = {
  timeout: 60000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Accept': 'application/json, text/plain, */*'
  }
};

const APIKEY = process.env.GTECH_APIKEY || 'APIKEY';

router.get('/', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      status: false,
      error: 'Missing Facebook URL'
    });
  }

  if (!/facebook\.com|fb\.watch/i.test(url)) {
    return res.status(400).json({
      status: false,
      error: 'Invalid Facebook URL'
    });
  }

  try {
    const apiUrl =
      `https://gtech-api-xtp1.onrender.com/api/download/fb?url=${encodeURIComponent(url)}&apikey=${APIKEY}`;

    const response = await axios.get(apiUrl, AXIOS_DEFAULTS);

    // 🔥 SAME STRUCTURE AS BOT
    const videos = response?.data?.data?.data;

    if (!response?.data?.status || !Array.isArray(videos) || !videos.length) {
      throw new Error('No downloadable video found');
    }

    // Highest quality first
    const sorted = videos.sort((a, b) => {
      const qa = parseInt(a.resolution) || 0;
      const qb = parseInt(b.resolution) || 0;
      return qb - qa;
    });

    const selected = sorted[0];

    const videoUrl = selected.url.startsWith('http')
      ? selected.url
      : `https://gtech-api-xtp1.onrender.com${selected.url}`;

    return res.json({
      status: true,
      source: url,
      resolution: selected.resolution || 'Unknown',
      download_url: videoUrl
    });

  } catch (err) {
    console.error('[FB API ERROR]', err.message);
    return res.status(500).json({
      status: false,
      error: 'Failed to download Facebook video'
    });
  }
});

module.exports = router;

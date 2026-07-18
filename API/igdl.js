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

router.get('/', async (req, res) => {
  const { url } = req.query;

  if (!url || !url.includes('instagram.com')) {
    return res.status(400).json({
      status: false,
      error: 'Invalid or missing Instagram URL'
    });
  }

  try {
    const apiUrl =
      `https://api-aswin-sparky.koyeb.app/api/downloader/igdl?url=${encodeURIComponent(url)}`;

    const response = await axios.get(apiUrl, AXIOS_DEFAULTS);

    // 🔥 SAME STRUCTURE AS BOT PLUGIN
    if (!response.data?.status || !Array.isArray(response.data.data)) {
      throw new Error('Invalid API response');
    }

    const result = response.data.data.map(item => ({
      type: item.type,        // video | image
      download_url: item.url
    }));

    return res.json({
      status: true,
      source: url,
      count: result.length,
      result
    });

  } catch (err) {
    console.error('[IG API ERROR]', err.message);
    return res.status(500).json({
      status: false,
      error: 'Failed to download Instagram media'
    });
  }
});

module.exports = router;

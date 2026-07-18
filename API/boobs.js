const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Direct Delirius random images endpoint
    const apiUrl = 'https://delirius-apiofc.vercel.app/nsfw/boobs';

    // Stream response directly
    const streamRes = await axios.get(apiUrl, { responseType: 'stream' });

    // Set headers from Delirius
    const contentType = streamRes.headers['content-type'] || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'inline');

    streamRes.data.pipe(res);

  } catch (err) {
    console.error("ArslanMD Stream Error:", err.message);
    res.status(500).send("Failed to fetch content from ArslanMD");
  }
});

module.exports = router;

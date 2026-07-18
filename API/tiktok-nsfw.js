const express = require('express');
const axios = require('axios');
const router = express.Router();

async function fetchVideo(retry = 3) {
  try {
    const res = await axios.get(
      'https://delirius-apiofc.vercel.app/nsfw/tiktok',
      {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      }
    );

    const data = res.data;

    return (
      data?.video ||
      data?.url ||
      data?.result?.video ||
      data?.result?.url ||
      null
    );
  } catch (err) {
    if (retry > 0) {
      return await fetchVideo(retry - 1);
    }
    throw err;
  }
}

router.get('/', async (req, res) => {
  try {
    const videoUrl = await fetchVideo();

    if (!videoUrl) {
      return res.status(502).json({
        status: false,
        message: 'Source API did not return a video'
      });
    }

    const stream = await axios.get(videoUrl, {
      responseType: 'stream',
      timeout: 30000
    });

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'inline; filename="tiktok.mp4"');

    stream.data.pipe(res);

  } catch (err) {
    res.status(503).json({
      status: false,
      message: 'Source API is currently unavailable',
      hint: 'Try again after few seconds'
    });
  }
});

module.exports = router;

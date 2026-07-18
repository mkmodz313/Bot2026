const express = require('express');
const axios = require('axios');
const router = express.Router();

// Download website series video
router.get('/', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ status:false, message:"Series URL required" });

  try {
    // Call Delirius API
    const apiUrl = `https://api.giftedtech.co.ke/api/download/xnxxdl?apikey=gifted&url=${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl);

    if (!response.data || !response.data.result) {
      return res.status(500).json({ status:false, message:"Video fetch failed" });
    }

    const videoUrl = response.data.result.downloadUrl || response.data.result.url;

    if (!videoUrl) return res.status(404).json({ status:false, message:"Download URL not found" });

    // Stream video to user
    const videoRes = await axios.get(videoUrl, { responseType:'stream', maxContentLength: 300*1024*1024 }); // max 300MB

    res.setHeader('Content-Disposition', `attachment; filename="video.mp4"`);
    res.setHeader('Content-Type', 'video/mp4');
    videoRes.data.pipe(res);

  } catch (err) {
    console.error("Series Download Error:", err.response?.data || err.message);
    res.status(500).json({ status:false, message:"Video fetch failed", error: err.response?.data || err.message });
  }
});

module.exports = router;

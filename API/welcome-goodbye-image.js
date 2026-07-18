const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
  const { name, profile, welcome } = req.query;

  if (!name || !profile) {
    return res.status(400).json({ error: 'Parameters name and profile are required.' });
  }

  try {
    const response = await axios.post('https://lemon-welcome.vercel.app/api/generate-image', {
      name,
      image: profile,
      welcome: welcome === 'true'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://lemon-welcome.vercel.app'
      },
      responseType: 'arraybuffer'
    });

    const buffer = Buffer.from(response.data);
    res.set('Content-Type', 'image/png');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create image.' });
  }
});

module.exports = router;
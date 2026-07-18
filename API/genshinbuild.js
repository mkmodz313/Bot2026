const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

router.get('/', async (req, res) => {
  const character = req.query.q?.toLowerCase();

  if (!character) {
    return res.status(400).json({ status: 400, message: 'Parameter q (query) is required.' });
  }

  const url = `https://keqingmains.com/q/${character}-quickguide/`;

  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://keqingmains.com/',
        'Connection': 'keep-alive'
      }
    });

    const $ = cheerio.load(data);
    const images = [];

    $('img').each((i, el) => {
      const src = $(el).attr('src');
      if (src && src.includes('/wp-content/uploads/') && src.toLowerCase().includes(character)) {
        images.push(src);
      }
    });

    if (images.length < 2) {
      return res.status(404).json({ status: 404, message: `Image for character '${character}' not found.` });
    }

    const imageUrl = images[1];
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      headers: {
        'Referer': 'https://keqingmains.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    res.setHeader('Content-Type', 'image/png');
    res.send(Buffer.from(response.data));
  } catch (e) {
    res.status(500).json({ status: 500, message: 'An error occurred while fetching data.' });
  }
});

module.exports = router;
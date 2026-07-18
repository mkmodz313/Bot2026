const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send('Please enter the Pastebin URL you want to read.');
  }
  if (!url.includes('pastebin.com')) {
    return res.status(400).send('Invalid URL! Make sure the URL is from Pastebin.');
  }

  try {
    const rawUrl = url.replace('pastebin.com/', 'pastebin.com/raw/');
    const response = await axios.get(rawUrl);

    if (!response.data) {
      return res.status(404).send('No content found. The URL may be empty or invalid.');
    }

    res.type('text/plain').send(response.data);
  } catch (error) {
    console.error('Error in getpastebin:', error.message);
    res.status(500).send(`An error occurred while fetching the text. Error: ${error.message}`);
  }
});

module.exports = router;
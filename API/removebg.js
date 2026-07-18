const express = require('express');
const axios = require('axios');
const router = express.Router();

// Route for removing background with image URL (GET method)
router.get('/', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({
        status: false,
        message: 'URL parameter is required. Usage: /removebg?url=IMAGE_URL'
      });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return res.status(400).json({
        status: false,
        message: 'Invalid URL format'
      });
    }

    // Download image from URL
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Validate content type
    const contentType = response.headers['content-type'];
    if (!contentType || !contentType.startsWith('image/')) {
      return res.status(400).json({
        status: false,
        message: 'URL does not point to a valid image'
      });
    }

    const imageBuffer = Buffer.from(response.data);
    const result = await removebg(imageBuffer);
    
    if (!result.status) {
      return res.status(400).json({
        status: false,
        message: result.message
      });
    }

    // Convert base64 to buffer and send as image
    const processedImageBuffer = Buffer.from(result.image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    
    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': 'inline; filename="removed-bg.png"',
      'Cache-Control': 'public, max-age=3600'
    });
    
    res.send(processedImageBuffer);

  } catch (error) {
    console.error('Error:', error);
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(400).json({
        status: false,
        message: 'Unable to download image from URL'
      });
    }
    
    if (error.code === 'ETIMEDOUT') {
      return res.status(400).json({
        status: false,
        message: 'Request timeout while downloading image'
      });
    }

    res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
});

// Function to remove background
async function removebg(buffer) {
  try {
    if (!buffer) return { status: false, message: "Buffer not found" };
    
    return await new Promise((resolve, reject) => {
      const image = buffer.toString("base64");
      axios.post("https://us-central1-ai-apps-prod.cloudfunctions.net/restorePhoto", {
        image: `data:image/png;base64,${image}`,
        model: "fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003"
      }).then(res => {
        const data = res.data?.replace(/"/g, "");
        console.log('API Response Status:', res.status);
        if (!data) return reject("Failed to remove image background.");
        resolve({ status: true, image: data });
      }).catch(reject);
    });
  } catch (e) {
    return { status: false, message: e.message || e };
  }
}

module.exports = router;
/*
📌 REST API: AI Upscale Image
🌐 Source API: https://fooocus.one
👨‍💻 Author: SaaOfc + Mod by ChatGPT
*/

const express = require('express');
const axios = require('axios');
const multer = require('multer');
const fs = require('fs');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Endpoint: POST /upscale
router.post('/upscale', upload.single('image'), async (req, res) => {
    const { scale = 4, faceEnhance = 'true' } = req.body;
    const imageFile = req.file;

    if (!imageFile) {
        return res.status(400).json({ status: false, message: 'Image must be uploaded (field: image)' });
    }

    const scaleNum = parseInt(scale);
    const faceEnhanceBool = faceEnhance === 'true';

    if (isNaN(scaleNum) || scaleNum < 2 || scaleNum > 10) {
        return res.status(400).json({ status: false, message: 'Scale must be between 2-10' });
    }

    try {
        // Convert to Base64
        const fileBuffer = fs.readFileSync(imageFile.path);
        const base64Image = `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;

        // Send request to fooocus API
        const start = await axios.post(
            'https://fooocus.one/api/predictions',
            {
                version: 'f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa',
                input: {
                    face_enhance: faceEnhanceBool,
                    image: base64Image,
                    scale: scaleNum
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0',
                    'Origin': 'https://fooocus.one',
                    'Referer': 'https://fooocus.one/id/apps/batch-upscale-image'
                }
            }
        );

        const predictionId = start.data.data.id;

        // Poll until status is success
        let result;
        while (true) {
            const statusCheck = await axios.get(`https://fooocus.one/api/predictions/${predictionId}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                    'Referer': 'https://fooocus.one/id/apps/batch-upscale-image'
                }
            });

            if (statusCheck.data.status === 'succeeded') {
                result = statusCheck.data.output;
                break;
            } else if (statusCheck.data.status === 'failed') {
                throw new Error('Upscale failed');
            }

            await new Promise(r => setTimeout(r, 3000));
        }

        // Delete file after processing
        fs.unlinkSync(imageFile.path);

        // Send the result response
        return res.json({
            status: true,
            scale: scaleNum,
            faceEnhance: faceEnhanceBool,
            result: result[0] // upscaled result link
        });

    } catch (error) {
        console.error('[API ERROR]', error.message);
        return res.status(500).json({ status: false, message: 'Failed to process upscale.' });
    }
});

module.exports = router;
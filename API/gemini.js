const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI('AIzaSyDdfNNmvphdPdHSbIvpO5UkHdzBwx7NVm0');

router.get('/', async (req, res) => {
    try {
        const { text } = req.query;

        if (!text) {
            return res.status(400).json({ 
                error: "Text parameter is required",
                example: {
                    url: "/gemini?text=What is artificial intelligence?"
                }
            });
        }

        const prompt = `${text.trim()}\n\nReply in English and use emojis to be more expressive. 😊🔥`;
        
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const response = await model.generateContent([prompt]);

        let replyText = "Sorry, AI did not provide an answer.";
        
        if (response?.response?.candidates?.length) {
            replyText = response.response.candidates[0].content.parts.map(part => part.text.trim()).join("\n") || replyText;
        }

        res.json({ 
            success: true,
            answer: replyText 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

module.exports = router;
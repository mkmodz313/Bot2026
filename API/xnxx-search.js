const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
  const q = req.query.q || req.query.query;
  const limit = req.query.limit || 10;
  if (!q) return res.status(400).json({ status:false, message:"Query cannot be empty" });

  try {
    const response = await axios.get(`https://delirius-apiofc.vercel.app/search/xnxxsearch?query=${encodeURIComponent(q)}`);
    return res.json(response.data);
  } catch (e) {
    return res.status(500).json({ status:false, message: "API error", error: e.response?.data || e.message });
  }
});

module.exports = router;

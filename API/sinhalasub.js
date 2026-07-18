const express = require("express");
const cheerio = require("cheerio");
const axios = require("axios");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const router = express.Router();

/* ================= SEARCH ================= */
router.get("/search", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ status: false, message: "Query required" });

  try {
    const url = `https://sinhalasub.lk/tvshows/?s=${encodeURIComponent(q)}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Cookie": "starstruck_8c9b99985687fb6ab1d030c04b088ebb"
      }
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    const results = $(".search-page .result-item article").map((i, el) => ({
      no: i + 1,
      title: $(el).find(".details .title a").text().trim(),
      description: $(el).find(".details .contenido p").text().trim(),
      image: $(el).find(".image img").attr("src"),
      type: $(el).find(".image span").text().trim(),
      year: $(el).find(".details span .rating").text().trim(),
      link: $(el).find(".details .title a").attr("href")
    })).get();

    res.json({ status: true, result: results });

  } catch (e) {
    res.status(500).json({ status: false, message: e.message });
  }
});

/* ================= INFO ================= */
router.get("/info", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ status: false, message: "URL required" });

  try {
    const html = await (await fetch(url)).text();
    const $ = cheerio.load(html);

    const episodes = [];
    $("#seasons li").each((_, el) => {
      episodes.push({
        title: $(el).find(".numerando").text(),
        date: $(el).find("span.date").text(),
        link: $(el).find("a").attr("href")
      });
    });

    res.json({
      status: true,
      result: {
        title: $("h1").first().text(),
        imdb: $("#repimdb strong").text(),
        date: $(".date").first().text(),
        description: $("#info p").first().text(),
        episodes
      }
    });

  } catch (e) {
    res.status(500).json({ status: false, message: e.message });
  }
});

/* ================= DOWNLOAD ================= */
router.get("/download", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ status: false, message: "URL required" });

  try {
    const html = await (await fetch(url)).text();
    const $ = cheerio.load(html);

    const rows = [];
    $("#download table tbody tr").each((_, tr) => {
      rows.push({
        quality: $(tr).find("td:nth-child(2)").text().trim(),
        size: $(tr).find("td:nth-child(3)").text().trim(),
        page: $(tr).find("a").attr("href")
      });
    });

    const links = await Promise.all(rows.map(async r => {
      try {
        const p = await axios.get(r.page);
        const $p = cheerio.load(p.data);
        return { ...r, link: $p("#download-link").attr("href") };
      } catch {
        return r;
      }
    }));

    res.json({
      status: true,
      result: {
        title: $("#info h1").text(),
        episode: $("#info h3").text(),
        links
      }
    });

  } catch (e) {
    res.status(500).json({ status: false, message: e.message });
  }
});

module.exports = router;

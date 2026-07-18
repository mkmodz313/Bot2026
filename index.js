const express = require("express");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");

const app = express();

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { error: "Too many requests, please try again later." },
    keyGenerator: (req) => {
        return req.headers["x-forwarded-for"]?.split(",")[0] || req.ip;
    },
    standardHeaders: true,
    legacyHeaders: false
});

app.use(cors());

const routes = [
    "ytdl", "twitterdl", "moviesdetail", "sinhalasub", "girls-pack", "boobs", "nsfw-corean", "xnxx-dl", "xnxx-search", "tiktok-nsfw", "spotidl", "moviesdl", "moviesearch", "igdl", "fbdl", "ttdl", "gitclone", "spotifydl", "aptoide",
    "githubstalk", "searchgroups", "randommeme", "ttsearch", "ytsearch", "npmsearch", "googlesearch", "duckduckgo",
    "pinterest", "spotifysearch", "gistalk", "llama-3.3-70b-versatile", "blackboxai", "gemini", "ghibliimage",
    "txt2img", "genshinbuild", "tweet", "getpastebin", "ssweb", "translate", "nulis", "cuaca", "qrcodegenerator", "readqr", "emojimix", "removebg", "welcome-goodbye-image", "web2zip",
    "vcc", "cekkhodam", "tahukahkamu", "brat", "qc", "detiknews", "kompasnews"
];

routes.forEach(route => {
    app.use(`/api/${route}`, limiter, require(`./api/${route}`));
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/docs", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "documentation.html"));
});

app.use("/api/*", (req, res) => {
    res.status(404).json({ 
        error: true,
        message: "API endpoint not found",
        documentation: "/docs"
    });
});

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

module.exports = app;

const express = require("express");
const router = express.Router();
const weather = require("weather-js");

router.get("/", async (req, res) => {
    try {
        const kota = req.query.kota;
        if (!kota) {
            return res.status(400).json({ status: 400, message: "Please enter the city name in the query, example: /api/weather?kota=Jakarta" });
        }

        weather.find({ search: kota, degreeType: "C" }, (err, result) => {
            if (err || !result || result.length === 0) {
                return res.status(404).json({ status: 404, message: "City not found" });
            }

            const lokasi = result[0].location;
            const data = result[0].current;
            res.json({
                status: 200,
                result: {
                    kota: lokasi.name,
                    negara: lokasi.country,
                    zona_waktu: `GMT ${lokasi.timezone >= 0 ? "+" : ""}${lokasi.timezone}`,
                    suhu: `${data.temperature}°C`,
                    kondisi: data.skytext,
                    kelembaban: `${data.humidity}%`,
                    angin: `${data.windspeed}`,
                    tekanan: `${data.pressure} mb`,
                    indeks_uv: data.uvIndex
                }
            });
        });
    } catch (error) {
        res.status(500).json({ status: 500, message: "An error occurred" });
    }
});

module.exports = router;
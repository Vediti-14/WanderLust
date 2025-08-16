const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const axios = require("axios");
require("dotenv").config(); // Load OPENCAGE_API_KEY from .env

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});

    // Add owner to each listing object
    initData.data = initData.data.map((obj) => ({
        ...obj,
        owner: "6888d759a3c62988d594832d",
    }));

    // 🔁 Add geocoding for each listing using OpenCage API
    for (let listing of initData.data) {
        try {
            const geoRes = await axios.get("https://api.opencagedata.com/geocode/v1/json", {
                params: {
                    q: listing.location,
                    key: process.env.OPENCAGE_API_KEY,
                },
            });

            const geo = geoRes.data.results[0].geometry;
            listing.geometry = {
                type: "Point",
                coordinates: [geo.lng, geo.lat],
            };
        } catch (err) {
            console.error(`Geocoding failed for ${listing.title} (${listing.location}):`, err.message);
        }
    }

    await Listing.insertMany(initData.data);
    console.log("data was initialized");
};

initDB();

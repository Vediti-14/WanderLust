const Listing = require("../models/listing");
const axios = require("axios");
const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY; // ✅ Your OpenCage key

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = async (req, res) => {
    res.render("listings/new.ejs", {
        openCageKey: process.env.OPENCAGE_API_KEY
    });
};


module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: { path: "author" }
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  try {
    const newListing = new Listing(req.body.listing);

    // ✅ Use coordinates from client (sent via hidden inputs)
    if (
      req.body.listing.geometry &&
      Array.isArray(req.body.listing.geometry.coordinates)
    ) {
      const rawCoords = req.body.listing.geometry.coordinates;
      console.log("📍 Raw coordinates:", rawCoords);

      const coords = rawCoords.map((c, i) => {
        const num = parseFloat(c);
        if (isNaN(num)) {
          console.error(`❌ Invalid coordinate at index ${i}:`, c);
          throw new Error(`Invalid coordinate value: ${c}`);
        }
        return num;
      });

      newListing.geometry = {
        type: req.body.listing.geometry.type || "Point",
        coordinates: coords,
      };
    } else {
      req.flash("error", "Missing or invalid coordinates from form.");
      return res.redirect("/listings/new");
    }

    // Server-side geocoding for verification (optional)
    const geoResponse = await axios.get(
      "https://api.opencagedata.com/geocode/v1/json",
      {
        params: {
          q: req.body.listing.location,
          key: OPENCAGE_API_KEY,
        },
      }
    );

    const geometry = geoResponse.data.results[0]?.geometry;

    if (!geometry) {
      req.flash("error", "Invalid location (Geocoding failed).");
      return res.redirect("/listings/new");
    }

    // Optionally overwrite client coordinates with server ones (if you want)
    // newListing.geometry.coordinates = [geometry.lng, geometry.lat];

    //  Handle uploaded image via multer (Cloudinary)
    if (req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    //  Set listing owner
    newListing.owner = req.user._id;
    console.log("Saving listing now...");

    //  Save to DB
    await newListing.save();

    req.flash("success", "New Listing Created!");
    res.redirect(`/listings/${newListing._id}`);
  } catch (err) {
    console.error("❌ Error creating listing:", err.message);
    req.flash("error", "Something went wrong while creating the listing.");
    res.redirect("/listings/new");
  }
};


module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    // Ensure coordinates are numbers if they exist
    if (req.body.listing?.geometry?.coordinates) {
        req.body.listing.geometry.coordinates = req.body.listing.geometry.coordinates.map(Number);
    }

    
    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect(`/listings`);
};
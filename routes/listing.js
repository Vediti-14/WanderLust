const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing");
const {isLoggedIn,isOwner,validateListing} = require("../middleware.js");

const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");

const upload = multer({ storage });




router
.route("/")
//index route
.get( wrapAsync(listingController.index))
//create route
.post(
    isLoggedIn,
    
    upload.single("image"),
    validateListing,
    wrapAsync(listingController.createListing)
);
    
    
// new route 
router.get("/new",isLoggedIn, listingController.renderNewForm );



router
.route("/:id")
//show route
.get(wrapAsync(listingController.showListing))
// Update route
.put(
    isLoggedIn,
    isOwner,
    upload.single("image"),
    validateListing,
     wrapAsync(listingController.updateListing))
     
//delete route
.delete(
    isOwner,
    isLoggedIn, wrapAsync(listingController.destroyListing));






// Edit route
router.get("/:id/edit",isLoggedIn, 
    isOwner,
    wrapAsync(listingController.renderEditForm));





module.exports = router;
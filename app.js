const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const Review = require("./models/review");

const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");

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

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.get('/', (req, res) => {
    res.send("I am root");
});

const validateListing = (req,res,next) =>{
    let {error} =  listingSchema.validate(req.body);

  if(error){
    let errMsg = error.details.map((el)=> el.message).join(",");

    throw new ExpressError(400,errMsg);
  }
  else{
    next();
  }
};

//index route
app.get("/listings", wrapAsync(async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}));

// new route 
app.get("/listings/new", async(req,res)=>{
    res.render("listings/new.ejs");
});

//show route
app.get("/listings/:id", wrapAsync(async(req,res)=>{
    let{id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
}));

//create route
app.post("/listings",
    validateListing,
    wrapAsync(async (req, res, next) => {

    /*if(!req.body.listing){
        throw new ExpressError(400,"Send valid data for listing");
    }*/
  
    console.log(req.body);
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

// Edit route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

// Update route
app.put("/listings/:id",
    validateListing,
     wrapAsync(async (req, res) => {
    //if(!req.body.listing){
      //  throw new ExpressError(400,"Send valid data for listing");
    //}
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
}));

//delete route
app.delete("/listings/:id", wrapAsync(async(req,res)=>{
    let{id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));


//Reviews
//Post route

app.post("/listings/:id/reviews",async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
     await newReview.save();
     await listing.save();

     res.redirect(`/listings/${listing._id}`);
});


/*
app.get("/testListing",async(req,res) =>{
    let sampleListing = new Listing({
        title:"My New Villa",
        description:"By the beach",
        price: 1200,
        location:"Calangute , Goa",
        country:"India",
    });
    await sampleListing.save();
    console.log("sample was saved");
    res.send("successful testing");
})
*/
//standard response
/*app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
})*/


app.use((err,req,res,next)=>{
    let {statusCode = 500, message = "Something went wrong"} = err;
    //res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs" ,{err});

});

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});

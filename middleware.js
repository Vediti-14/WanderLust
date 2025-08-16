//for is owner middleware
const Listing = require("./models/listing");
// for validate

const {listingSchema,reviewSchema} = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");
//for review author
const Review = require("./models/review");


module.exports.isLoggedIn = (req,res,next)=>
    {if(!req.isAuthenticated())
        {
            req.session.redirectUrl = req.originalUrl;
        req.flash("error","you must be logged in to create/edit listing!")
         return res.redirect("/login");
    }
    next();
}


module.exports.saveRedirectUrl = (req,res,next) =>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};


module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
//important 
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    if (!listing.owner || !listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "Not the owner of listing");
        return res.redirect(`/listings/${id}`);
    }

    next();
};


//for listing validation method
module.exports.validateListing = (req,res,next) =>{
    let {error} =  listingSchema.validate(req.body);

  if(error){
    let errMsg = error.details.map((el)=> el.message).join(",");

    throw new ExpressError(400,errMsg);
  }
  else{
    next();
  }
};


//for server side review validation method
module.exports.validateReview= (req,res,next) =>{
    let {error} =  reviewSchema.validate(req.body);

  if(error){
    let errMsg = error.details.map((el)=> el.message).join(",");

    throw new ExpressError(400,errMsg);
  }
  else{
    next();
  }
};

///for review delete route
module.exports.isReviewAuthor = async(req,res,next) =>{
    let { id,reviewId } = req.params;
        let review = await Review.findById(reviewId);
        if (!review) {
        req.flash("error", "Review not found!");
        return res.redirect(`/listings/${id}`);
    }
        if(!review.author ||!review.author.equals(res.locals.currUser._id)){
            req.flash("error","Not the author of this review");
         return res.redirect(`/listings/${id}`)
        }
        next();

};

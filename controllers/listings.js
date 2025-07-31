const Listing = require("../models/listing");

module.exports.index = async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}


module.exports.renderNewForm = async(req,res)=>{
    
    res.render("listings/new.ejs");
}


 module.exports.showListing =async(req,res)=>{
    let{id} = req.params;
    const listing = await Listing.findById(id)
    .populate({path:"reviews",
      populate:{
        path:"author",
      }  
    })
    .populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
}


module.exports.createListing = async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    
    // Save Cloudinary image to newListing.image
    newListing.image = {
        url: req.file.path,
        filename: req.file.filename
    };

    newListing.owner = req.user._id; // Set owner
    await newListing.save();

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
}



 module.exports.renderEditForm =async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
         return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl.replace("/upload","/upload/w_250")//for blur

    res.render("listings/edit.ejs", { listing ,originalImageUrl});
}


 module.exports.updateListing = async (req, res) => {
    //if(!req.body.listing){
      //  throw new ExpressError(400,"Send valid data for listing");
    //}
    let { id } = req.params;
    /*let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error","You don't have permission to edit");
     return res.redirect(`/listings/${id}`)
    }*/
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if(typeof req.file !=="undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url,filename};
    await listing.save();
    }
    req.flash("success"," Listing updated !");
    res.redirect(`/listings/${id}`);
}




 module.exports.destroyListing =async (req, res) => {
    //if(!req.body.listing){
      //  throw new ExpressError(400,"Send valid data for listing");
    //}
    const { id } = req.params;
    /*let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error","You don't have permission to edit");
     return res.redirect(`/listings/${id}`)
    }*/
    await Listing.findByIdAndDelete(id);
    req.flash("success"," Listing Deleted!");
    res.redirect(`/listings`);
}
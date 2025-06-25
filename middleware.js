const Listing = require("./models/listing.js");
const ExpressError = require("./utils/ExpressErrors.js");
const {listingSchema,reviewSchema} = require("./schema.js");
const Review = require("./models/reviews.js");

module.exports.isLoggedIn = (req, res, next) => {
//   console.log(req.user);
  if (!req.isAuthenticated()) {
    // redirectUrl save 
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "you must be logged In");
    return res.redirect("/login");
  }
  next();
};


module.exports.saveRedirectUrl = (req,res,next)=>{
  if (req.session.redirectUrl){
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};


module.exports.isOwner = async (req,res,next)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if( res.locals.currUser && !listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error","You are not the Owner of this listing");
        res.redirect(`/listings/${id}`);
        return;
    }
    next();
}


module.exports.validateListing = (req,res,next)=>{
let {error} = listingSchema.validate(req.body);
    // console.log(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        // console.log(errMsg);
        throw new ExpressError(400 , errMsg);
    }else {
        next();
    }
};



module.exports.validateReview = (req,res,next)=>{
let {error} = reviewSchema.validate(req.body);
    // console.log(error);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        // console.log(errMsg);
        throw new ExpressError(400 , errMsg);
    }else {
        next();
    }
};


module.exports.isReviewAuthor = async (req,res,next)=>{
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author._id.equals(res.locals.currUser._id)){
        req.flash("error","You don'have permission to delete this review");
        res.redirect(`/listings/${id}`);
        return;
    }
    next();
}





module.exports.isFileExist = (req,res,next)=>{
    // console.log(req.file);
    if(typeof req.file == "undefined"){
        throw new ExpressError(400,"Please upload a valid image");
    }
    next()
} 

// module.exports.isCategoryValid = (req,res,next)=>{
//     // console.log(req.body);
//     //     if (!req.body.listing || typeof req.body.listing.category === "undefined") {
//     //     req.flash("error", "Invalid form submission. Please try again.");
//     //     return res.redirect("/listings/new");
//     // }
//     if(req.body.listing.category.equals("none")){
//         req.flash("error", "Please select a category");
//         return res.redirect("/listings/new");
//     }  
//     next()
// } 

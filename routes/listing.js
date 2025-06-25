const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");

const {isLoggedIn , isOwner, validateListing, isFileExist} = require("../middleware.js");


const listingController = require("../controllers/listings.js");

const multer = require("multer");

const { storage } = require("../couldConfig.js");

const upload = multer({storage}); 


router.route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn,validateListing,upload.single('listing[image]'),isFileExist ,wrapAsync(listingController.createtListing));
    // .post( upload.single('listing[image]'), (req,res)=>{
    //     res.send(req.file);
    // });


// New route : 
router.get("/new",isLoggedIn, listingController.renderNewForm  );



router.route("/category")
.get(wrapAsync(listingController.showListingQuery));



router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isOwner,validateListing, upload.single('listing[image]'),wrapAsync(listingController.updateListing))
    .delete(isLoggedIn,isOwner, wrapAsync(listingController.destroyListing));

// edit route : 
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.renderEditForm));


// category route :
router.route("/category/:name")
.get(
    wrapAsync(listingController.showListingCategory)
)




// Index route :
// router.get("/", wrapAsync(listingController.index));



// show route :
// router.get("/:id", wrapAsync(listingController.showListing));




// create route :
// router.post("/",isLoggedIn, validateListing, wrapAsync(listingController.createtListing));




// update route :
// router.put("/:id",isLoggedIn,isOwner, validateListing, wrapAsync(listingController.updateListing));


// Delete route :
// router.delete("/:id",isLoggedIn,isOwner, wrapAsync(listingController.destroyListing));


module.exports = router; 

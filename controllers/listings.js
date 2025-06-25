const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken:mapToken});

module.exports.index = async(req,res)=>{
    let allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}


module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs");
}


module.exports.showListing = async(req,res)=>{
    let id = req.params.id;
    const listing = await Listing.findById(id).populate({path:"reviews",populate:{path:"author"},}).populate("owner");
    // console.log(listing);
    if (!listing) {
        req.flash("error", "Listing Not exist!");
        res.redirect("/listings");
        return
    }
    res.render("listings/show.ejs", {listing});
}

module.exports.showListingCategory = async(req,res)=>{
    let {name} = req.params;
    const listings = await Listing.find({category: name});
    res.render("listings/category.ejs",{listings});
}

module.exports.showListingQuery = async(req,res)=>{
    let {query} = req.query;
    query = query.toLowerCase();
    const listings = await Listing.find({$or : [{category:query}, {country:query}, {location:query}]});
    // console.log(listings);
    if(!listings.length>0){
        req.flash("error","No listings found");
        return res.redirect("/listings");
    }
    res.render("listings/category.ejs",{listings});
}

module.exports.createtListing = async (req,res)=>{
    // let {title , description , image, price, country , location} = req.body;
    // let listing = req.body.listing;  

    // let result = listingSchema.validate(req.body);
    // console.log(result);
    // if(result.error){
    //     throw new ExpressError(400 , result.error);
    // }
    
    if(req.body.listing.category=="none"){
        req.flash("error", "Please select a category");
        return res.redirect("/listings/new");
    }
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 2
    })
    .send()
    // console.log(response.body.features[0].geometry);

    // console.log(req.file);
    let url = req.file.path;
    let filename = req.file.filename;
    // console.log(url,filename);

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url , filename};

    newListing.geometry = response.body.features[0].geometry;

    await newListing.save();
    


    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
 
}





module.exports.renderEditForm = async (req,res)=>{
    let id = req.params.id;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing Not exist!");
        res.redirect("/listings");
        return
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");

    res.render("listings/edit.ejs",{listing, originalImageUrl});
}




module.exports.updateListing = async(req,res)=>{
    // if (!req.bosy.listing){
    //     throw new ExpressError(400, "Send valid data for Listing")
    // }
    let {id} = req.params;

    if(req.body.listing.category=="none"){
        req.flash("error", "Please select a category");
        return res.redirect(`/listings/${id}/edit`);
    }



    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});

    
    if (typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url , filename};
        await listing.save();
    } 


    
    if(listing.location) {
        
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 2
    })
    .send()
    listing.geometry = response.body.features[0].geometry;
    await listing.save();

    }


    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${id}`);
}



module.exports.destroyListing = async(req,res)=>{
    let id = req.params.id;
    let deletedItem = await Listing.findByIdAndDelete(id);
    // console.log(deletedItem);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}



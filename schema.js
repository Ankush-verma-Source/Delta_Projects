const Joi = require('joi'); 

module.exports.listingSchema = Joi.object({
    listing : Joi.object({ // defining listing object is present in body request
        title : Joi.string().required(),
        description: Joi.string().required(),
        location : Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        catergory: Joi.string().required(),
        // image: Joi.object({
        //     url : Joi.string().required(),
        //     path : Joi.string().required()
        // }).required(),
    }).required()
});


module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment : Joi.string().required()
    }).required()
});
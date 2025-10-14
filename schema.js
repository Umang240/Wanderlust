const Joi= require("joi");

// validation schema for listings
module.exports.listingSchema= Joi.object({
    listing: Joi.object({
        title:Joi.string().required(),
        description:Joi.string().required(),
        location:Joi.string().required(),
        country:Joi.string().required(),
        price:Joi.number().required().min(0),
        image:Joi.string().allow("",null),
        mapUrl:Joi.string().uri().allow(" ", null)
    }).required()
});

// validation schema for review schema
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required(),
        comment: Joi.string().required()
    }).required()
});
const listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema}=require("./schema.js");
const {reviewSchema}=require("./schema.js");


module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectURL = req.originalUrl;
    req.flash("error", "Please login for adding new listing");
    res.redirect("/login");
  } else {
    next();
  }
};

// middleware for directing user to wanted URL
module.exports.savedredirectURL = (req, res, next) => {
  if (req.session.redirectURL) {
    res.locals.redirectURL = req.session.redirectURL;
  }
  next();
};

// middleware for protecting routes from authorized access
module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listings = await listing.findById(id);
  if (!req.user || String(listings.owner._id) !== String(req.user._id)) {
    req.flash("error", "You are not allowed to do this !");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.validateListing = (req,res,next) => {
  let {error} = listingSchema.validate(req.body);
  if(error){
    let ermsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400,ermsg);
  }else{
    next();
  }
};

module.exports.validatereview = (req,res,next) => {
  let {error} = reviewSchema.validate(req.body);
  if(error){
    let ermsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400,ermsg);
  }else{
    next();
  }
};

module.exports.isAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!req.user || String(review.author._id) !== String(req.user._id)) {
    req.flash("error", "This review does not belong to you !");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
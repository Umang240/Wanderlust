const express = require("express");
const router = express.Router({mergeParams: true});
const Review = require("../models/review.js");
const listing = require("../models/listing.js");
const wrapAsync=require("../utils/wrapAsync.js");
const {validatereview ,isLoggedIn, isAuthor } = require("../middleware.js");

const reviewController = require("../Controllers/reviews.js");

//post route
router.post("/", validatereview ,
  isLoggedIn,
  wrapAsync(reviewController.postreview));

// review delete
router.delete("/:reviewId",
  isLoggedIn,
  isAuthor,
  wrapAsync(reviewController.deletereview));

module.exports = router;
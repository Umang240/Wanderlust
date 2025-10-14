const express = require("express");
const router = express.Router();
const listing = require("../models/listing.js");
const wrapAsync=require("../utils/wrapAsync.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

const listingControllers = require("../Controllers/listings.js");

router.route("/")
.get(wrapAsync(listingControllers.index))
.post( 
      isLoggedIn, 
      validateListing,
      upload.single('listing[image]'),
      wrapAsync(listingControllers.newlisting)
);

router.get("/search", wrapAsync(listingControllers.searchListing));
router.get("/new", isLoggedIn, listingControllers.renderCreateForm);

router.route("/:id")
.get( wrapAsync(listingControllers.showListing))
.put( isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(listingControllers.putEdit))
.delete(isLoggedIn, wrapAsync(listingControllers.deletelisting));

//Edit Route
router.get("/:id/edit", isLoggedIn, 
  isOwner,
  wrapAsync(listingControllers.editForm)
);

module.exports = router;

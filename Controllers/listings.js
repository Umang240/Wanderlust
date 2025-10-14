const listing = require("../models/listing.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");


module.exports.index = async (req, res) => {
  const allistings = await listing.find({});
  res.render("listings/index.ejs", { allistings });
};

module.exports.renderCreateForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listings = await listing.findById(id).populate({
    path: "reviews",
    populate: {
      path: "author",
    }
    })
    .populate("owner");
    res.render("listings/show.ejs", { listings });
};

module.exports.newlisting = async(req, res,next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    let result=listingSchema.validate(req.body, { abortEarly: false });
    if(result.error){
      throw new ExpressError(400, result.error);
    }
    const newListing = new listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    // Auto-generate mapUrl if not provided
    if (!newListing.mapUrl) {
      newListing.mapUrl = `https://www.google.com/maps/place/${encodeURIComponent(newListing.location + ', ' + newListing.country)}`;
    }
    await newListing.save();
    req.flash("success", "New listing successfully created");
    res.redirect("/listings");
};

module.exports.editForm = async (req, res) => {
  let { id } = req.params;
  const listings = await listing.findById(id);
  if(!listings){
    req.flash("error", "Cannot find that listing");
    res.redirect("/listings");
  }
  let originalimageUrl = listings.image.url;
  originalimageUrl = originalimageUrl.replace("/upload", "/upload/h_300,w_300");
  // Pass the resized image URL to the template
  res.render("listings/edit.ejs", { listings, originalimageUrl });
};

module.exports.putEdit = async (req, res) => {
  let { id } = req.params;
  const updatedListing = await listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

  if(typeof req.file !== 'undefined'){
    let url = req.file.path;
    let filename = req.file.filename;
    updatedListing.image = {url, filename};
    await updatedListing.save();
  }

  // Auto-generate mapUrl if not provided
  if (!updatedListing.mapUrl) {
    updatedListing.mapUrl = `https://www.google.com/maps/place/${encodeURIComponent(updatedListing.location + ', ' + updatedListing.country)}`;
    await updatedListing.save();
  }

  req.flash("success", "Listing edited successfully");
  res.redirect(`/listings/${id}`);
};

module.exports.deletelisting = async(req,res)=>{ 
  let {id}=req.params;
  let dellisting=await listing.findByIdAndDelete(id);
  req.flash("success", "Listing successfully deleted");
  res.redirect("/listings");
};

module.exports.searchListing = async(req, res) => {
  const query = req.query.q || req.query.query;
  if (!query || query.trim() === "") {
    // If no query, return all listings
    const results = await listing.find({});
    return res.json(results);
  }
  const regex = new RegExp(query, 'i'); // case-insensitive

  const results = await listing.find({
    $or: [
      { title: regex },
      { description: regex },
      { location: regex },
      { country: regex }
    ]
  });

  res.json(results);
};
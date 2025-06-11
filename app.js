const express = require("express");
const app = express();
const mongoose = require("mongoose");
const listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsmate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema}=require("./schema.js");


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsmate);
app.use(express.static(path.join(__dirname,"/public")));

app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

//Index Route
app.get("/listings", async (req, res) => {
  const allistings = await listing.find({});
  res.render("listings/index.ejs", { allistings });
});

//New Route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// about us route
app.get("/listings/aboutus",(req,res)=>{
  res.render("listings/about_us.ejs");
})

//Show Route
app.get("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listings = await listing.findById(id);
  res.render("listings/show.ejs", { listings });
})
);

//Create Route
app.post("/listings", wrapAsync(async(req, res,next) => {
    let result=listingSchema.validate(req.body, { abortEarly: false });
    console.log(result);
    if(result.error){
      throw new ExpressError(400, result.error);
    }
    const newListing = new listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
})
);

//Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listings = await listing.findById(id);
  res.render("listings/edit.ejs", { listings });
})
);

//Update Route
app.put("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  await listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
})
);

//Delete route
app.delete("/listings/:id", wrapAsync(async(req,res)=>{
  let {id}=req.params;
  let dellisting=await listing.findByIdAndDelete(id);
  console.log(dellisting);
  res.redirect("/listings");
})
);

// app.use((err,req,res,next)=>{
//   res.send("Sorry, Something went wrong!");
// })


app.all("/:any",(req,res,next)=>{
  next(new ExpressError(404,"Page Not Found!"));
});

app.use((err,req,res,next)=>{
  let {statusCode=500, message="Sorry,Something went wrong"}=err;
  res.status(statusCode).render("error.ejs",{statusCode,message});
});


app.listen(8080, () => {
  console.log("Server is listening at the port");
});

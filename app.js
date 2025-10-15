if(process.env.NODE_ENV != "Production"){
   require("dotenv").config();
}

const express = require("express"); 
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ExpressError=require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const ejsmate=require("ejs-mate");


const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");



const dbURL = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbURL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsmate);
app.use(express.static(path.join(__dirname,"/public")));



const store = MongoStore.create({
  mongoUrl : dbURL,
  crypto: {
    secret: "mysecret"
  },
  touchAfter: 24 * 3600 
})

store.on("error", () =>{
  console.log("Error by mongo-session store side", err);
})

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }
};

app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
 

app.use((req,res,next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});


app.get("/home", (req, res) => {
  res.render("listings/home.ejs");
});


app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/",userRouter);

// about us
app.get("/about", (req,res) => {
   res.render("listings/aboutUs.ejs");
})


// privacy route
app.get("/privacy", (req,res) =>{
   res.render("listings/privacy.ejs");
})

// terms & condition route
app.get("/terms", (req,res) =>{
  res.render("listings/terms.ejs")
})


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

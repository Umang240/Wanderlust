const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { savedredirectURL } = require("../middleware.js");

const userController = require("../Controllers/user.js");

router.route("/signup")
.get(userController.signupform)
.post(wrapAsync (userController.postsignup));


router.route("/login")
.get(userController.getlogin)
.post(savedredirectURL,
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
  }),
  userController.postlogin
);

router.get("/logout", userController.logout);

module.exports = router;

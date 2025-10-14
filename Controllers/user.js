const User = require("../models/user.js");

module.exports.signupform = (req,res) => {
    res.render("user/signup.ejs");
};

module.exports.postsignup = async(req,res) => { 
    try{
    let {username, email, password} = req.body;
    const newUser = new User({username,email});
    const registerUser = await User.register(newUser,password);
    console.log(registerUser);
    req.login(registerUser, err => {  //login user after signup
      if (err) return next(err);
      req.flash("success", "Welcome  to Wanderlust");
      res.redirect("/home");
    });
  }
    catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.getlogin = (req,res) => {
    res.render("user/login.ejs");
};

module.exports.postlogin =  (req, res) => {
    req.flash("success", "Welcome back to Wanderlust");
    res.redirect(res.locals.redirectURL || "/listings");
};

module.exports.logout = (req,res,next) => {
  req.logout((err) => {
     if(err){
      next(err);
     }
     req.flash("success", "You are logged out");
     res.redirect("/listings");
  })
};
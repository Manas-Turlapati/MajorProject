const User = require("../models/user.js");
module.exports.renderSignup = (req, res) => {
  res.render("users/signup.ejs");
};
module.exports.signupUser = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "User Registered Successfully!");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.renderLogin = (req, res) => {
  res.render("users/login.ejs");
};
module.exports.loginUser = async (req, res) => {
  req.flash("success", "You logged in Successfully!");
  let redirectUrl = res.locals.redirectUrl;
  if (redirectUrl) {
    return res.redirect(redirectUrl);
  }
  res.redirect("/listings");
};
module.exports.logoutUser = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are now logged out!Have a nice day :)");
    res.redirect("/listings");
  });
};
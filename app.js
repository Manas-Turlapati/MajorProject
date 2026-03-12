if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path"); //for ejs
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const User = require("./models/user.js");
const app = express();
const dbUrl = process.env.ATLASDB_URL;
app.set("view engine", "ejs"); //for ejs
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
async function main() {
  await mongoose.connect(dbUrl);
}
main()
  .then(() => {
    console.log("Mongodb connected successfully");
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`App is listening on port ${PORT}...`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "/public")));
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});
store.on("error", (err) => {
  console.log("Error in mongo session store", err);
});
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, //security purposes to avoid cross scripting attacks not needed details just know it
  },
};
// app.get("/", (req, res) => {
//   res.send("Working");
// });
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); //to create and store the information of the user during a session
passport.deserializeUser(User.deserializeUser()); //to delete the information of the user when the session is closed
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});
app.use("/listings", listingRouter); //express routes for listings for which routes /listings are common
app.use("/listings/:id/reviews", reviewRouter); //express routes for reviews for which routes /listings/:id/reviews are common
app.use("/", userRouter);
app.get(/.*/, (req, res, next) => {
  next(new ExpressError("Page Not Found!", 400));
});
app.use((err, req, res, next) => {
  let { message = "error found!", statusCode = 500 } = err;
  res.status(statusCode).render("error.ejs", { message });
});

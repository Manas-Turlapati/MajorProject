const Listing = require("./models/listing.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./schema.js");
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be loggedin!");
    req.session.redirectUrl = req.originalUrl;
    return res.redirect("/login");
  }
  next();
};
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};
module.exports.isOwner = async(req, res, next) => {
  const editId = req.params.id;
  const listing = await Listing.findById(editId);
  if(res.locals.currUser&&!listing.owner.equals(res.locals.currUser._id)){
    req.flash("error","You are not accessed to make the changes! :(");
    return res.redirect(`/listings/${editId}`);
  }
  next();
};
module.exports.validateListing = (req,res,next)=>{
    console.log(req.body);
    let {error}= listingSchema.validate(req.body);
    
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(errMsg,400);
        
    }
    else{
        next();
    }
}
module.exports.validateReview = (req,res,next)=>{
    let {error}= reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(errMsg,400);
    }
    else{
       
        next();
    }
}


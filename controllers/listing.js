const Listing = require("../models/listing");
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};
module.exports.renderNewForm = async (req, res) => {
  res.render("listings/new.ejs");
};
module.exports.showListing = async (req, res) => {
  let id = req.params.id;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "reviewOwner",
        model: "User",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};
module.exports.createListing = async (req, res) => {
  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = {url,filename};
  newListing.geometry ={
    type:"Point",
    coordinates :[parseFloat(req.body.listing.longitude),parseFloat(req.body.listing.latitude)]
  }
  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};
module.exports.editListing = async (req, res) => {
  let id = req.params.id;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  let originalImageUrl= listing.image.url;
  originalImageUrl=originalImageUrl.replace("/upload","/upload/h_300,w_250");
  res.render("listings/edit.ejs", { listing,originalImageUrl });
};
module.exports.updateListing = async (req, res) => {
  let {id} = req.params;
  let updatelisting = await Listing.findByIdAndUpdate(id,{...req.body.listing});
  updatelisting.geometry = {
    type:"Point",
    coordinates:[parseFloat(req.body.listing.longitude),parseFloat(req.body.listing.latitude)]
  }
  console.log(req.body.listing);
  if(typeof req.file !=="undefined"){//to check if the req.file contains any url or file  if yes then only we have to put the image url and filename in the image
    let url = req.file.path;
    let filename = req.file.filename;
    updatelisting.image = {url,filename};
  }
  await updatelisting.save();
  req.flash("success", "Listing Updated Successfully!");
  res.redirect(`/listings/${id}`);
};
module.exports.deleteListing = async (req, res) => {
  let id = req.params.id;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted Successfully!");
  res.redirect("/listings");
};
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
module.exports.createReview = async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newreview = await Review.create(req.body.review);
  newreview.reviewOwner = req.user._id;
  await newreview.save();
  listing.reviews.push(newreview);
  await listing.save();
  req.flash("success", "New Review Created!");
  res.redirect(`/listings/${listing._id}`);
};
module.exports.deleteReview = async (req, res) => {
  let id = req.params.id;
  let reviewId = req.params.reviewId;
  let review = await Review.findById(reviewId);
  if (review.reviewOwner.equals(res.locals.currUser._id)) {
    await Listing.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");
    return res.redirect(`/listings/${id}`);
  }
  req.flash("error", "You dont have permission to delete the review :(");
  res.redirect(`/listings/${id}`);
};
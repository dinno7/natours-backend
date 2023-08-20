const { AppError } = require('../../../utils');

exports.setBeforeCreateReviewData = function(req, res, next) {
  req.body.tour = req.body?.tour || req.params.tourId;
  req.body.user = req.body?.user || req.user._id;
  if (!req.body.review || !req.body.rating || !req.body.user || !req.body.tour)
    return next(
      new AppError('Please provide all review, rating, user, tour fields', 400)
    );
};

// This is for get reviews in one special tour
exports.setInitialGetAllReviewFilters = function(req) {
  const { tourId, reviewId } = req.params;
  let filter = {};
  if (tourId) filter.tour = tourId;
  if (reviewId) filter._id = reviewId;
  return filter;
};

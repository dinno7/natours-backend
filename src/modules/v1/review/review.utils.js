const { AppError } = require('../../../utils');

exports.setBeforeCreateReviewData = function (req, res, next) {
  req.body.tour = req.body?.tour || req.params.tourId;
  req.body.user = req.body?.user || res.locals.user._id;
  if (!req.body.review || !req.body.rating || !req.body.user || !req.body.tour)
    return next(
      new AppError('Please provide all review, rating, user, tour fields', 400),
    );
};

// This is for get reviews in one special tour
exports.setInitialGetAllReviewFilters = function (req, res, next) {
  const { tourId, reviewId } = req.params;
  req.initialFilters = {};
  if (tourId) {
    req.initialFilters.tour = tourId;
  }
  if (reviewId) {
    req.initialFilters._id = reviewId;
  }
  next();
};

const { catchError, AppError, deleteOne } = require('../../../utils');
const Review = require('./review.model');

module.exports = {
  createReview: catchError(async function(req, res, next) {
    req.body.tour = req.body?.tour || req.params.tourId;
    req.body.user = req.body?.user || req.user._id;
    const { review, rating, user, tour } = req.body;
    if (!review || !rating || !user || !tour)
      return next(
        new AppError('Please provide review, rating, user, tour fields', 400)
      );
    const newReview = await Review.create({
      review,
      rating,
      user,
      tour
    });

    res.send({
      ok: true,
      status: 'success',
      data: { newReview }
    });
  }),
  getAllReviews: catchError(async function(req, res, next) {
    const { tourId, reviewId } = req.params;
    let filter = {};
    if (tourId) filter.tour = tourId;
    if (reviewId) filter._id = reviewId;
    const reviews = await Review.find(filter);

    res.send({
      ok: true,
      status: 'success',
      result: reviews.length,
      data: { reviews }
    });
  }),

  getReviewById: catchError(async function(req, res, next) {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review)
      return next(new AppError('Review with this id is not exist', 404));

    res.send({
      ok: true,
      status: 'success',
      data: { review }
    });
  }),

  deleteReview: deleteOne(Review, 'review')
};

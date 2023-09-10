const Review = require('./review.model');
const { factory } = require('../../../utils');
const {
  setInitialGetAllReviewFilters,
  setBeforeCreateReviewData,
} = require('./review.utils');

module.exports = {
  getAllReviews: [setInitialGetAllReviewFilters, factory.getAll(Review)],
  getReviewById: factory.getOneById(Review),
  createReview: factory.createOne(Review, setBeforeCreateReviewData),
  updateReview: factory.updateOne(Review),
  deleteReview: factory.deleteOne(Review),
};

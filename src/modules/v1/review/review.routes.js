const { Router } = require('express');
const reviewController = require('./review.controller');
const authController = require('../global/auth.controller');
const router = Router({ mergeParams: true });

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(authController.restrictTo('user'), reviewController.createReview);

router
  .route('/:id')
  .get(reviewController.getReviewById)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

module.exports = router;

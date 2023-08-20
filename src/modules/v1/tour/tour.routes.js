const { Router } = require('express');
const router = Router();

const tourController = require('./tour.controllers');
const authController = require('../global/auth.controller');

const reviewsRouter = require('../review/review.routes');

// >> / ==> /api/v1/tours/

router.use('/:tourId/reviews/:reviewId?', reviewsRouter);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/get-5-Top')
  .get(tourController.get5TopTours, tourController.getAllTours);

router.route('/tours-status').get(tourController.getToursStatus);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/:id')
  .get(tourController.getTourById)
  .patch(tourController.updateTour)
  .delete(
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;

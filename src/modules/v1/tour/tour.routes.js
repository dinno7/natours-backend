const { Router } = require('express');

const router = Router();
const tourController = require('./tour.controllers');
const { objectIdValidation } = require('../../../middlewares/route');

// >> / ==> /api/v1/tours/
router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/get-5-Top')
  .get(tourController.get5TopTours, tourController.getAllTours);

router.route('/tours-status').get(tourController.getToursStatus);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router.param('id', objectIdValidation);
router
  .route('/:id')
  .get(tourController.getTourById)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;

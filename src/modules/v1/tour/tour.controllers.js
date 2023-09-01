const Tour = require('./tour.model');
const { catchError, factory, AppError } = require('../../../utils');
const { sendSuccessResponse } = require('../../../utils/global');

exports.get5TopTours = function(req, res, next) {
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'price,name,ratingsAverage,summery,difficulty';
  req.query.limit = 5;
  next();
};

exports.getToursStatus = catchError(async function(req, res, next) {
  const tours = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.6 } } },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        count: { $sum: 1 },
        ratingsAverage: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        maxPrice: { $max: '$price' },
        minPrice: { $min: '$price' },
        sumRatingsQuantity: { $sum: '$ratingsQuantity' }
      }
    }
  ]);

  return sendSuccessResponse(res, { tours }, tours.length);
});

exports.getMonthlyPlan = catchError(async function(req, res, next) {
  const monthsInString = [
    '',
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];
  const year = +req.params.year;
  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        tourCount: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    // { $addFields: { month: '$_id' } }
    {
      $addFields: {
        month: {
          $arrayElemAt: [monthsInString, '$_id']
          // $let: {
          //   vars: {
          //     monthsInString: [
          //       '',
          //       'January',
          //       'February',
          //       'March',
          //       'April',
          //       'May',
          //       'June',
          //       'July',
          //       'August',
          //       'September',
          //       'October',
          //       'November',
          //       'December'
          //     ]
          //   },
          //   in: { $arrayElemAt: ['$$monthsInString', '$_id'] }
          // }
        }
      }
    }
    // { $project: { name: 1, startDates: 1 } }
  ]);

  return sendSuccessResponse(res, { plan }, plan.length);
});

exports.getAllTours = factory.getAll(Tour);
exports.getTourById = factory.getOneById(Tour, 'reviews');
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
exports.getTourWithin = catchError(async function(req, res, next) {
  // /tour-within/:distance/center/:latlng/unit/:unit
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng)
    return next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400
      )
    );

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  return sendSuccessResponse(res, { tours }, tours.length);
});

exports.getDistances = catchError(async function(req, res, next) {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  if (!lat || !lng)
    return next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400
      )
    );

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [+lng, +lat]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  return sendSuccessResponse(res, { distances }, distances.length);
});

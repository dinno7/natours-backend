const multer = require('multer');
const sharp = require('sharp');
const Tour = require('./tour.model');
const { catchError, factory, AppError } = require('../../../utils');
const { sendSuccessResponse } = require('../../../utils/global');

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image'))
    return cb(new AppError('Please provide valid image', 400), false);

  return cb(null, true);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = catchError(async (req, res, next) => {
  if (!req?.files?.imageCover || !req?.files?.images) return next();

  req.body.imageCover = `tour-${req.params.id}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 80 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  req.body.images = [];
  const promises = req.files.images.map((img, i) => {
    const imgName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
    req.body.images.push(imgName);

    return sharp(img.buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 80 })
      .toFile(`public/img/tours/${imgName}`);
  });
  await Promise.all(promises);

  next();
});

exports.get5TopTours = function (req, res, next) {
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'price,name,ratingsAverage,summery,difficulty';
  req.query.limit = 5;
  next();
};

exports.getToursStatus = catchError(async function (req, res, next) {
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
        sumRatingsQuantity: { $sum: '$ratingsQuantity' },
      },
    },
  ]);

  return sendSuccessResponse(res, { tours }, tours.length);
});

exports.getMonthlyPlan = catchError(async function (req, res, next) {
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
    'December',
  ];
  const year = +req.params.year;
  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        tourCount: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    // { $addFields: { month: '$_id' } }
    {
      $addFields: {
        month: {
          $arrayElemAt: [monthsInString, '$_id'],
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
        },
      },
    },
    // { $project: { name: 1, startDates: 1 } }
  ]);

  return sendSuccessResponse(res, { plan }, plan.length);
});

exports.getAllTours = factory.getAll(Tour);
exports.getTourById = factory.getOneById(Tour, 'reviews');
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
exports.getTourWithin = catchError(async function (req, res, next) {
  // /tour-within/:distance/center/:latlng/unit/:unit
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng)
    return next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400,
      ),
    );

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  return sendSuccessResponse(res, { tours }, tours.length);
});

exports.getDistances = catchError(async function (req, res, next) {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  if (!lat || !lng)
    return next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400,
      ),
    );

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [+lng, +lat],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  return sendSuccessResponse(res, { distances }, distances.length);
});

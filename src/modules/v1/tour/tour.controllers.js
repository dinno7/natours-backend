const Tour = require('./tour.model');
const { catchError, factory } = require('../../../utils');
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

// // >> Filtering
// const reqQuery = { ...req.query };
// const excludeQuery = ['sort', 'page', 'limit', 'fields'];
// excludeQuery.forEach(item => delete reqQuery[item]);
// let filters = JSON.stringify(reqQuery);
// filters = filters.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
// filters = JSON.parse(filters);

// let mainQuery = Tour.find(filters);

// // >> Sorting
// let sortStr = req.query.sort;
// if (sortStr) {
//   sortStr = sortStr.replace(/\,/g, ' ');
//   mainQuery = mainQuery.sort(sortStr);
// }

// // >> Field limiting
// let fieldsStr = req.query.fields;
// if (fieldsStr) {
//   fieldsStr = fieldsStr.replace(/\,/g, ' ');
//   mainQuery = mainQuery.select(fieldsStr);
// } else {
//   mainQuery = mainQuery.select('-__v');
// }

// // >> Pagination
// let page = +req.query.page || 1;
// let limit = +req.query.limit || 10;
// let skip = (page - 1) * limit;
// if (req.query.page) {
//   const countOfModel = await Tour.countDocuments();
//   if (skip >= countOfModel) createError('This page does not exist', 404);
// }
// mainQuery = mainQuery.skip(skip).limit(limit);

// >> Execute tours query
// let { query } = new APIFeatures(Tour, req.query)
//   .filter()
//   .sort()
//   .limitFields()
//   .paginate();
// const tours = await query;
// const responseObj = {
//   tours
// };

// if (req.query?.page && req.query?.limit) {
//   allTourCountForPagination = await Tour.estimatedDocumentCount();
//   responseObj.allToursCount = allTourCountForPagination;
// }

// return sendSuccessResponse(res, responseObj, tours.length);

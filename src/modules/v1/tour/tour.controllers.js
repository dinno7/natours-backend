const Tour = require('./tour.model');
const { APIFeatures, AppError } = require('../../../utils');

module.exports = {
  get5TopTours: function(req, res, next) {
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'price,name,ratingsAverage,summery,difficulty';
    req.query.limit = 5;
    next();
  },

  getToursStatus: async function(req, res, next) {
    const result = await Tour.aggregate([
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
    return res.status(200).send({
      ok: true,
      result: result.length,
      data: result
    });
  },

  getMonthlyPlan: async function(req, res, next) {
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

    return res.status(200).send({
      ok: true,
      result: plan.length,
      data: plan
    });
  },

  getAllTours: async function(req, res, next) {
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
    let { query } = new APIFeatures(Tour, req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await query;
    const responseObj = {
      ok: true,
      result: tours?.length,
      data: {
        tours
      }
    };

    if (req.query?.page && req.query?.limit) {
      allTourCountForPagination = await Tour.estimatedDocumentCount();
      responseObj.allToursCount = allTourCountForPagination;
    }

    return res.status(200).send(responseObj);
  },

  getTourById: async function(req, res, next) {
    const tourId = req.params.id;
    const tour = await Tour.findById(tourId);
    if (!tour) return next(new AppError('There is no tour with sent id', 404));
    return res.status(200).send({
      ok: true,
      result: 1,
      data: {
        tour: tour
      }
    });
  },

  createTour: async function(req, res, next) {
    let params = req.body;
    const newTour = await Tour.create(params);
    return res.status(201).send({
      ok: true,
      result: 1,
      data: {
        tour: newTour
      }
    });
  },

  updateTour: async function(req, res, next) {
    let tourId = req.params.id;
    let params = JSON.parse(JSON.stringify(req.body));
    const updatedTour = await Tour.findByIdAndUpdate(
      tourId,
      {
        $set: params
      },
      { new: true, runValidators: true }
    );

    if (!updatedTour)
      return next(new AppError('Can not find tour with this id', 404));

    return res.status(200).send({
      ok: true,
      result: 1,
      data: {
        updatedTour
      }
    });
  },

  deleteTour: async function(req, res, next) {
    const tourId = req.params.id;
    const deletedTour = await Tour.findByIdAndDelete(tourId);

    if (!deletedTour)
      return next(new AppError('The tour with this id is not exist', 404));

    return res.status(200).send({
      ok: true,
      result: 1,
      data: { deletedTour }
    });
  }
};

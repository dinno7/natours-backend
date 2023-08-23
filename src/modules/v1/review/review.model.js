const mongoose = require('mongoose');
const Tour = require('../tour/tour.model');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      require: [true, 'The review field is require']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',

      require: [true, 'Review must belong to a Tour']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      require: [true, 'Review must belong to a User']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.pre(/^find/, function(next) {
  this.populate({ path: 'user', select: 'name' });
  next();
});

// Calculate average rating in tour after create new review
reviewSchema.post('save', async function(savedDoc, next) {
  if (!savedDoc) return next();
  await savedDoc.constructor.calcAverageRating(savedDoc.tour);
  next();
});

// Calculate average rating in tour after update and delete review
reviewSchema.post(/^findOneAnd/, async function(res, next) {
  if (!res) return next();
  await res.constructor.calcAverageRating(res.tour);
  next();
});

// Save ratings avg and rating quantity in tour model (for after create new review)
reviewSchema.statics.calcAverageRating = async function(tourId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        nAvgRating: { $avg: '$rating' }
      }
    }
  ]);
  let ratingsUpdate = {
    ratingsAverage: 0,
    ratingsQuantity: 0
  };
  if (stats.length > 0) {
    ratingsUpdate.ratingsQuantity = stats[0].nRating;
    ratingsUpdate.ratingsAverage = stats[0].nAvgRating;
  }
  await Tour.findByIdAndUpdate(tourId, ratingsUpdate);
};

const reviewModel = mongoose.model('Review', reviewSchema);

module.exports = reviewModel;

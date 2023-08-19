const mongoose = require('mongoose');

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

const reviewModel = mongoose.model('Review', reviewSchema);

module.exports = reviewModel;

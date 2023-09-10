const { catchError } = require('../../../utils');
const Tour = require('../tour/tour.model');

exports.getOverview = catchError(async (req, res, next) => {
  const tours = await Tour.find();
  res.render('overview', { tours });
});

exports.getTour = catchError(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate([
    {
      path: 'reviews',
      select: 'review rating user',
    },
    {
      path: 'guides',
      select: 'name role photo',
    },
  ]);
  res.render('tour', { tour, title: tour.name });
});

exports.login = function (req, res, next) {
  res.render('login', {
    title: 'Login into your account',
  });
};
exports.signup = function (req, res, next) {
  res.render('signup', {
    title: 'Register',
  });
};

exports.account = async function (req, res, next) {
  res.render('account', {
    title: 'Your account',
  });
};

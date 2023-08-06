const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../user/user.model');
const { AppError } = require('../../../utils');

// >> Utils functions:
const generateJWT = id =>
  jwt.sign({ id }, process.env.JWT_SECRET_64, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

// >> Controllers:
module.exports = {
  singUp: async function(req, res, next) {
    const { name, email, password, passwordConfirm } = req.body;
    const newUser = await User.create({
      name,
      email,
      password,
      passwordConfirm
    });

    const token = generateJWT(newUser._id);

    res.send({
      ok: true,
      status: 'success',
      token,
      data: {
        user: newUser
      }
    });
  },
  login: async function(req, res, next) {
    const { email, password } = req.body;

    // Check email and password that came from front-end
    if (!email || !password)
      return next(new AppError('Please provide email and password', 400));

    // Check is user exist and password is correct
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.isPasswordCorrect(password, user.password)))
      return next(new AppError('Incorrect email or password', 401));

    // Remove password from response and generate token then send them as a response
    user.password = undefined;
    const token = generateJWT(user._id);

    res.send({
      ok: true,
      status: 'success',
      token,
      data: {
        user
      }
    });
  }
};

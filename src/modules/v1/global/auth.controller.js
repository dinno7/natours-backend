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
  }
};

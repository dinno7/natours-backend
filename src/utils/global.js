const jwt = require('jsonwebtoken');
const crypto = require('crypto');

exports.hashToken = function(token) {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
};

exports.uuidv4 = function() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
};

exports.generateJWTToken = id =>
  jwt.sign({ id }, process.env.JWT_SECRET_64, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

exports.createSendJWTToken = function(res, user, statusCode = 200) {
  const jwtToken = exports.generateJWTToken(user._id);

  res.status(statusCode).send({
    ok: true,
    status: 'success',
    token: jwtToken,
    data: {
      user
    }
  });
};

exports.filterObj = function(obj, ...allowedFields) {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

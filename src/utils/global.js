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

exports.filterObj = function(obj, ...allowedFields) {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.sendSuccessResponse = function(
  res,
  data = undefined,
  resultCount = undefined,
  statusCode = 200,
  bodyData = {}
) {
  return res.status(statusCode).send({
    ok: true,
    status: 'success',
    result: resultCount,
    data,
    ...bodyData
  });
};

exports.getModelName = Model => Model?.modelName?.toLowerCase() || 'document';

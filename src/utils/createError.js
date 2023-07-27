function createError(msg, options) {
  if (typeof options == 'number') {
    options = { statusCode: options };
  }
  let error = new Error(msg);
  error = { message: error.message, ...options };
  throw error;
}

module.exports = createError;

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;

// function createError(msg, options) {
//   if (typeof options == 'number') {
//     options = { statusCode: options };
//   }
//   let error = new Error(msg);
//   error = { message: error.message, ...options };
//   throw error;
// }

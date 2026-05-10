const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server Error';

  if (err.name === 'CastError') { statusCode = 404; message = 'Resource not found'; }
  if (err.code === 11000) { statusCode = 400; message = 'Duplicate field value'; }
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }

  console.error(`[ERROR] ${statusCode}: ${message}`);
  res.status(statusCode).json({ success: false, message });
};

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { errorHandler, asyncHandler };

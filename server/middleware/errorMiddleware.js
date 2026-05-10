export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  // Default status: if the response already has a non-200 code, keep it; else 500
  let statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'An unexpected error occurred.';

  // Mongoose: bad ObjectId (e.g. /api/user/not-an-id)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found.';
  }

  // Mongoose: duplicate key (e.g. email already registered)
  if (err.code === 11000 && err.keyValue) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `An account with that ${field} already exists.`;
  }

  // Mongoose: validation error (schema required / enum / min-max)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(' ');
  }

  // Mongoose: buffering timed out — DB was unreachable when query ran
  if (err.name === 'MongooseError' && err.message.includes('buffering timed out')) {
    statusCode = 503;
    message = 'Database is temporarily unavailable. Please try again in a moment.';
  }

  // JWT: token expired or malformed
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Session is invalid. Please log in again.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Session has expired. Please log in again.';
  }

  res.status(statusCode).json({
    message,
    // Only send stack traces in development
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

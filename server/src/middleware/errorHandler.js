const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  let statusCode = err.statusCode || 500;

  // Log in development
  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    console.error(`[Error] ${err.name || 'Error'}: ${err.message}`);
  }

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with specified identifier: ${err.value}`;
    statusCode = 404;
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const val = err.keyValue ? err.keyValue[field] : '';
    const message = `An account or item with that ${field} ('${val}') already exists. Please choose another.`;
    statusCode = 409;
    return res.status(statusCode).json({
      success: false,
      message,
      field,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    statusCode = 400;
    return res.status(statusCode).json({
      success: false,
      message: messages[0] || 'Validation failed on supplied fields',
      errors: messages,
    });
  }

  // Multer upload error
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'The uploaded file exceeds the 2MB size limit. Please choose a smaller image.',
      });
    }
    return res.status(400).json({
      success: false,
      message: `Image upload failed: ${err.message}`,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Authentication token is invalid or expired.',
    });
  }

  // Default server error
  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error occurred.',
  });
};

module.exports = errorHandler;

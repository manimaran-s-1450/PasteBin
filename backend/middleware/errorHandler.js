/**
 * Global Error Handling Middleware
 */
function errorHandler(err, req, res, next) {
  console.error('💥 Error Stack:', err.stack || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack
      })
    }
  });
}

module.exports = errorHandler;
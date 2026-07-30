/**
 * 404 Not Found Middleware
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: {
      message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
      statusCode: 404
    }
  });
}

module.exports = notFoundHandler;
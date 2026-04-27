function errorHandler(err, req, res, next) {
  console.error('Error global interceptado:', err);
  
  if (res.headersSent) {
    return next(err);
  }

  if (res.error) {
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
    });
  }

  res.status(500).json({
    ok: false,
    message: 'Error interno del servidor',
  });
}

module.exports = errorHandler;

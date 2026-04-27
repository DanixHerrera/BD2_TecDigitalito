function responseMiddleware(req, res, next) {
  res.success = function (data = {}, message = 'Operación exitosa', statusCode = 200) {
    const payload = typeof data === 'object' && !Array.isArray(data) && data !== null 
      ? data 
      : { data };
      
    return res.status(statusCode).json({ 
      ok: true, 
      message, 
      ...payload 
    });
  };

  res.error = function (message = 'Error en la solicitud', statusCode = 400) {
    return res.status(statusCode).json({ ok: false, message });
  };

  res.errorNotFound = function (message = 'Recurso no encontrado') {
    return res.status(404).json({ ok: false, message });
  };

  next();
}

module.exports = responseMiddleware;

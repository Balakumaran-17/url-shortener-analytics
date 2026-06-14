const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

/**
 * Validator runner middleware.
 * Triggers error response if express-validator rules fail.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Map array errors to object dictionary [param]: msg
    const formattedErrors = {};
    errors.array().forEach(err => {
      formattedErrors[err.path] = err.msg;
    });

    return sendError(res, 400, 'Validation failed', formattedErrors);
  }
  next();
};

module.exports = validate;

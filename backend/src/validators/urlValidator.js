const { body } = require('express-validator');

const createUrlValidator = [
  body('longUrl')
    .trim()
    .notEmpty().withMessage('Destination URL is required')
    .isURL().withMessage('Please provide a valid URL address'),
  body('customAlias')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage('Custom alias must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9-_]+$/).withMessage('Custom alias can only contain alphanumeric characters, underscores, and hyphens'),
  body('expiresAt')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().withMessage('Expiry date must be a valid ISO8601 date string')
];

const updateUrlValidator = [
  body('longUrl')
    .optional()
    .trim()
    .isURL().withMessage('Please provide a valid URL address'),
  body('expiresAt')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().withMessage('Expiry date must be a valid ISO8601 date string')
];

module.exports = {
  createUrlValidator,
  updateUrlValidator
};

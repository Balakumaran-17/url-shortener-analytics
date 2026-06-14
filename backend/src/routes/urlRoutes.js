const express = require('express');
const urlController = require('../controllers/urlController');
const { createUrlValidator, updateUrlValidator } = require('../validators/urlValidator');
const validate = require('../middleware/validate');
const { urlCreationLimiter } = require('../middleware/rateLimiter');
const authenticateJWT = require('../middleware/auth');

const router = express.Router();

// Apply JWT authentication to all URL routes
router.use(authenticateJWT);

// Create short link with limiter
router.post('/', urlCreationLimiter, createUrlValidator, validate, urlController.create);

// Get list of all URLs (paginated, searched, sorted)
router.get('/', urlController.list);

// Get individual URL details
router.get('/:id', urlController.get);

// Edit URL target destination
router.put('/:id', updateUrlValidator, validate, urlController.update);

// Delete URL (soft delete)
router.delete('/:id', urlController.delete);

module.exports = router;

const express = require('express');
const redirectController = require('../controllers/redirectController');

const router = express.Router();

// Root level shortCode redirect match
router.get('/:shortCode', redirectController.redirect);

module.exports = router;

const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const authenticateJWT = require('../middleware/auth');

const router = express.Router();

// Publicly available link statistics endpoint
router.get('/public/:shortCode', analyticsController.publicStats);

// Protected dashboard aggregates
router.get('/dashboard', authenticateJWT, analyticsController.dashboard);

// Protected detailed graphs per url
router.get('/url/:id', authenticateJWT, analyticsController.urlDetail);

module.exports = router;

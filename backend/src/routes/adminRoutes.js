const express = require('express');
const authenticateJWT = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');
const adminController = require('../controllers/adminController');

const router = express.Router();

// All routes require authentication and admin privileges
router.use(authenticateJWT);
router.use(isAdmin);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.get('/urls', adminController.getUrls);
router.delete('/urls/:id', adminController.deleteUrl);

module.exports = router;

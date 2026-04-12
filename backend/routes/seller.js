const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard/stats', protect, authorize('seller', 'admin'), sellerController.getDashboardStats);

module.exports = router;
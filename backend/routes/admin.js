const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, authorize('admin'), adminController.getAdminStats);
router.get('/products', protect, authorize('admin'), adminController.getAllProducts);
router.put('/products/:productId/status', protect, authorize('admin'), adminController.updateProductStatus);
router.get('/users', protect, authorize('admin'), adminController.getAllUsers);
router.put('/users/:userId/role', protect, authorize('admin'), adminController.updateUserRole);
router.put('/users/:userId/toggle', protect, authorize('admin'), adminController.toggleUserStatus);

module.exports = router;
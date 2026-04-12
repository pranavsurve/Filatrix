const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

router.get('/', protect, orderController.getOrders);
router.get('/seller', protect, authorize('seller', 'admin'), orderController.getSellerOrders);
router.get('/:id', protect, orderController.getOrder);
router.put('/:id/status', protect, orderController.updateOrderStatus);
router.put('/:orderId/items/:itemId/downloaded', protect, orderController.markDownloaded);

router.post('/', [
  protect,
  body('shippingAddress.fullName').trim().notEmpty().withMessage('Full name is required'),
  body('shippingAddress.street').trim().notEmpty().withMessage('Street address is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
  body('shippingAddress.state').trim().notEmpty().withMessage('State is required'),
  body('shippingAddress.zipCode').trim().notEmpty().withMessage('Zip code is required'),
  body('shippingAddress.country').trim().notEmpty().withMessage('Country is required')
], validate, orderController.createOrder);

module.exports = router;
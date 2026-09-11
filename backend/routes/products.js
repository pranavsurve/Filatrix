const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const productController = require('../controllers/productController');
const reviewController = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');
const { upload, uploadImages, handleUploadError } = require('../middleware/upload');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

router.get('/categories', productController.getCategories);
router.get('/user/:userId', productController.getProducts);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);

router.post('/', [
  protect,
  authorize('seller', 'admin'),
  uploadImages.array('images', 5),
  handleUploadError,
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('category').isIn(['art', 'toys', 'home', 'tools', 'jewelry', 'other']).withMessage('Valid category is required')
], validate, productController.createProduct);

router.put('/:id', protect, productController.updateProduct);
router.delete('/:id', protect, productController.deleteProduct);

router.put('/images/:id', [
  protect,
  uploadImages.array('images', 5),
  handleUploadError
], productController.updateProductImages);

router.get('/:productId/reviews', reviewController.getProductReviews);
router.post('/:productId/reviews', [
  protect,
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
], validate, reviewController.addReview);

module.exports = router;
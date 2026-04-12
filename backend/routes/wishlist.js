const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

router.get('/', protect, wishlistController.getWishlist);
router.post('/', protect, wishlistController.addToWishlist);
router.delete('/:productId', protect, wishlistController.removeFromWishlist);
router.delete('/', protect, wishlistController.clearWishlist);

module.exports = router;
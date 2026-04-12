const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments({ seller: req.user._id });
    const approvedProducts = await Product.countDocuments({ seller: req.user._id, status: 'approved' });
    const pendingProducts = await Product.countDocuments({ seller: req.user._id, status: 'pending' });

    const orders = await Order.find()
      .populate('items.product');

    const sellerOrders = orders.filter(order =>
      order.items.some(item => item.product?.seller?.toString() === req.user._id.toString())
    );

    const totalEarnings = sellerOrders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, order) => {
        const sellerItems = order.items.filter(i => i.product?.seller?.toString() === req.user._id.toString());
        return sum + sellerItems.reduce((s, i) => s + (i.price * i.quantity), 0);
      }, 0);

    const totalSales = sellerOrders.length;

    res.json({
      success: true,
      stats: {
        totalProducts,
        approvedProducts,
        pendingProducts,
        totalEarnings,
        totalSales
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find()
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

exports.updateProductStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      { status },
      { new: true }
    ).populate('seller', 'name email');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, user: { id: user._id, isActive: user.isActive } });
  } catch (error) {
    next(error);
  }
};

exports.getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const pendingProducts = await Product.countDocuments({ status: 'pending' });
    const totalOrders = await Order.countDocuments();

    const revenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        pendingProducts,
        totalOrders,
        totalRevenue: revenue[0]?.total || 0
      }
    });
  } catch (error) {
    next(error);
  }
};
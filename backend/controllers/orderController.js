const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const invalidItems = cart.items.filter(item => !item.product);
    if (invalidItems.length > 0) {
      return res.status(400).json({ message: 'Some cart items are no longer available' });
    }

    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price
    }));

    const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const order = await Order.create({
      buyer: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      status: 'pending'
    });

    await order.populate('items.product', 'title thumbnail');

    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate('items.product', 'title thumbnail')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'title thumbnail modelFile')
      .populate('buyer', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.buyer._id.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin' &&
        order.items.some(item => item.product.seller.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const isBuyer = order.buyer.toString() === req.user._id.toString();
    const isSeller = order.items.some(item =>
      item.product.seller?.toString() === req.user._id.toString()
    );

    if (!isBuyer && !isSeller && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

exports.markDownloaded = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const order = await Order.findOne({
      _id: req.params.orderId,
      'items._id': itemId,
      buyer: req.user._id
    });

    if (!order) {
      return res.status(404).json({ message: 'Order item not found' });
    }

    const item = order.items.id(itemId);
    item.isDownloaded = true;
    await order.save();

    const product = await Product.findById(item.product);
    if (product) {
      product.downloadCount += 1;
      await product.save();
    }

    res.json({ success: true, message: 'Download marked' });
  } catch (error) {
    next(error);
  }
};

exports.getSellerOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('items.product')
      .populate('buyer', 'name email');

    const sellerOrders = orders.filter(order =>
      order.items.some(item => item.product?.seller?.toString() === req.user._id.toString())
    );

    res.json({ success: true, orders: sellerOrders });
  } catch (error) {
    next(error);
  }
};
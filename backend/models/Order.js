const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true
  },
  isDownloaded: {
    type: Boolean,
    default: false
  }
});

const orderSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    fullName: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  paymentId: {
    type: String
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'other'],
    default: 'stripe'
  },
  trackingNumber: String,
  notes: String
}, {
  timestamps: true
});

orderSchema.index({ buyer: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
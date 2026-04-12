const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['art', 'toys', 'home', 'tools', 'jewelry', 'other']
  },
  modelFile: {
    type: String,
    required: [true, '3D model file is required']
  },
  previewImages: [{
    type: String
  }],
  thumbnail: {
    type: String
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  fileType: {
    type: String,
    enum: ['stl', 'obj', 'both'],
    default: 'stl'
  },
  dimensions: {
    width: Number,
    height: Number,
    depth: Number
  },
  printSettings: {
    layerHeight: String,
    infill: String,
    material: String
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ seller: 1 });

module.exports = mongoose.model('Product', productSchema);
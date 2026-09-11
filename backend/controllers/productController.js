const Product = require('../models/Product');
const Review = require('../models/Review');

const normalizeTags = (tags) => {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return tags.map(t => String(t).trim()).filter(Boolean);
  }
  if (typeof tags === 'string') {
    return tags.split(',').map(t => t.trim()).filter(Boolean);
  }
  return [];
};

exports.getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, category, minPrice, maxPrice, search, sortBy, seller } = req.query;

    const query = { status: 'approved' };

    if (category) query.category = category;
    if (seller) query.seller = seller;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$text = { $search: search };
    }

    let sortOption = { createdAt: -1 };
    if (sortBy === 'price_asc') sortOption = { price: 1 };
    if (sortBy === 'price_desc') sortOption = { price: -1 };
    if (sortBy === 'rating') sortOption = { averageRating: -1 };
    if (sortBy === 'popular') sortOption = { downloadCount: -1 };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('seller', 'name avatar')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name avatar email');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const reviews = await Review.find({ product: product._id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, product, reviews });
  } catch (error) {
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { title, description, price, tags, category, dimensions, printSettings, fileType } = req.body;

    const product = await Product.create({
      title,
      description,
      price,
      tags: normalizeTags(tags),
      category,
      modelFile: req.file ? `/uploads/models/${req.file.filename}` : '',
      seller: req.user._id,
      dimensions,
      printSettings,
      fileType,
      status: req.user.role === 'admin' ? 'approved' : 'pending'
    });

    await product.populate('seller', 'name avatar');

    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('seller', 'name avatar');

    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

exports.getSellerProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ seller: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

exports.updateProductImages = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const previewImages = req.files.map(f => `/uploads/models/${f.filename}`);
    product.previewImages = previewImages;
    if (!product.thumbnail && previewImages.length > 0) {
      product.thumbnail = previewImages[0];
    }
    await product.save();

    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = [
      { id: 'art', name: 'Art & Sculpture', icon: 'palette' },
      { id: 'toys', name: 'Toys & Games', icon: 'toys' },
      { id: 'home', name: 'Home & Decor', icon: 'home' },
      { id: 'tools', name: 'Tools & Parts', icon: 'build' },
      { id: 'jewelry', name: 'Jewelry', icon: 'diamond' },
      { id: 'other', name: 'Other', icon: 'category' }
    ];

    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};
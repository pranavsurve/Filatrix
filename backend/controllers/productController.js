const Product = require('../models/Product');
const Review = require('../models/Review');
const { parseJsonField, buildPreviewImages } = require('../utils/parseBody');

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
    const { title, description, price, tags, category, printSettings, fileType, imageUrl } = req.body;
    const dimensions = parseJsonField(req.body.dimensions);
    const previewImages = buildPreviewImages(req.files, imageUrl);

    const product = await Product.create({
      title,
      description,
      price,
      tags: normalizeTags(tags),
      category,
      modelFile: req.modelFile ? `/uploads/models/${req.modelFile.filename}` : '',
      previewImages,
      thumbnail: previewImages[0] || '',
      seller: req.user._id,
      dimensions,
      printSettings: parseJsonField(printSettings, undefined),
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

    const updates = { ...req.body };
    if (updates.dimensions) {
      updates.dimensions = parseJsonField(updates.dimensions);
    }
    if (updates.tags) {
      updates.tags = normalizeTags(updates.tags);
    }
    if (updates.imageUrl !== undefined) {
      const url = String(updates.imageUrl || '').trim();
      if (url) {
        updates.previewImages = [url, ...(product.previewImages || []).filter(img => img !== url)];
        updates.thumbnail = updates.previewImages[0];
      }
      delete updates.imageUrl;
    }

    product = await Product.findByIdAndUpdate(req.params.id, updates, {
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

    const previewImages = req.files.map(f => `/uploads/images/${f.filename}`);
    product.previewImages = [...previewImages, ...(product.previewImages || [])].slice(0, 5);
    product.thumbnail = product.previewImages[0] || product.thumbnail;
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
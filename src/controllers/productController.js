

import Product        from '../models/Product.js';
import { getFileUrl } from '../middleware/upload.js';

export const getProducts = async (req, res, next) => {
  try {
    const { category, search, minPrice, maxPrice, sort = '-createdAt', page = 1, limit = 12 } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category.toLowerCase();
    if (search)   filter.$or = [{ title: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    const skip     = (Number(page) - 1) * Number(limit);
    const total    = await Product.countDocuments(filter);
    const products = await Product.find(filter).sort(sort).skip(skip).limit(Number(limit));
    res.json({ success:true, count:products.length, total, pages:Math.ceil(total/Number(limit)), page:Number(page), products });
  } catch (err) { next(err); }
};

export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('reviews.user', 'userName avatar');
    if (!product || !product.isActive) return res.status(404).json({ success:false, message:'Product not found' });
    res.json({ success:true, product });
  } catch (err) { next(err); }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category', { isActive:true });
    res.json({ success:true, categories });
  } catch (err) { next(err); }
};

// ─── GET FEATURED PRODUCTS (public) ──────────────────────────────────────────
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive:true, isFeatured:true })
      .sort({ featuredOrder:1, createdAt:-1 })
      .limit(12);
    res.json({ success:true, products });
  } catch (err) { next(err); }
};

// ─── TOGGLE FEATURED (admin) ──────────────────────────────────────────────────
export const toggleFeatured = async (req, res, next) => {
  try {
    const { isFeatured, featuredOrder } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isFeatured, featuredOrder: featuredOrder || 0 },
      { new:true }
    );
    if (!product) return res.status(404).json({ success:false, message:'Product not found' });
    res.json({ success:true, product });
  } catch (err) { next(err); }
};

export const createProduct = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.files && req.files.length > 0) {
      const urls  = req.files.map(f => getFileUrl(f.filename));
      data.image  = urls[0];
      data.images = urls;
    }
    const product = await Product.create(data);
    res.status(201).json({ success:true, product });
  } catch (err) { next(err); }
};

export const updateProduct = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.files && req.files.length > 0) {
      const urls  = req.files.map(f => getFileUrl(f.filename));
      data.image  = urls[0];
      data.images = urls;
    }
    const product = await Product.findByIdAndUpdate(req.params.id, data, { new:true, runValidators:true });
    if (!product) return res.status(404).json({ success:false, message:'Product not found' });
    res.json({ success:true, product });
  } catch (err) { next(err); }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive:false }, { new:true });
    if (!product) return res.status(404).json({ success:false, message:'Product not found' });
    res.json({ success:true, message:'Product deleted' });
  } catch (err) { next(err); }
};

export const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success:false, message:'Product not found' });
    const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString());
    if (alreadyReviewed) {
      alreadyReviewed.rating  = rating;
      alreadyReviewed.comment = comment;
    } else {
      product.reviews.push({ user:req.user._id, userName:req.user.userName, rating, comment });
    }
    product.updateRatingStats();
    await product.save();
    res.status(201).json({ success:true, product });
  } catch (err) { next(err); }
};

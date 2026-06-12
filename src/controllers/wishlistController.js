import Wishlist from '../models/Wishlist.js';
import Product  from '../models/Product.js';

// ─── GET WISHLIST ─────────────────────────────────────────────────────────────
export const getWishlist = async (req, res, next) => {
  try {
    const items = await Wishlist.find({ user: req.user._id }).populate(
      'product',
      'title price discount stock image category averageRating'
    );

    const products = items
      .filter((i) => i.product !== null) // guard against deleted products
      .map((i) => i.product);

    res.json({ success: true, count: products.length, wishlist: products });
  } catch (err) {
    next(err);
  }
};

// ─── TOGGLE (add / remove) ────────────────────────────────────────────────────
export const toggleWishlist = async (req, res, next) => {
  try {
    const productId = req.params.productId;

    // verify product exists
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const existing = await Wishlist.findOne({
      user:    req.user._id,
      product: productId,
    });

    if (existing) {
      await existing.deleteOne();
      return res.json({ success: true, action: 'removed', message: 'Removed from wishlist' });
    }

    await Wishlist.create({ user: req.user._id, product: productId });
    res.status(201).json({ success: true, action: 'added', message: 'Added to wishlist' });
  } catch (err) {
    next(err);
  }
};

// ─── CHECK IF IN WISHLIST ─────────────────────────────────────────────────────
export const checkWishlist = async (req, res, next) => {
  try {
    const exists = await Wishlist.exists({
      user:    req.user._id,
      product: req.params.productId,
    });
    res.json({ success: true, inWishlist: Boolean(exists) });
  } catch (err) {
    next(err);
  }
};

// ─── CLEAR WISHLIST ───────────────────────────────────────────────────────────
export const clearWishlist = async (req, res, next) => {
  try {
    await Wishlist.deleteMany({ user: req.user._id });
    res.json({ success: true, message: 'Wishlist cleared' });
  } catch (err) {
    next(err);
  }
};


import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName:  { type: String },
    rating:    { type: Number, required: true, min: 1, max: 5 },
    comment:   { type: String, trim: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    title:       { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, trim: true },
    price:       { type: Number, required: [true, 'Price is required'], min: 0 },
    discount:    { type: Number, default: 0, min: 0, max: 100 },
    stock:       { type: Number, default: 0, min: 0 },
    category:    { type: String, required: [true, 'Category is required'], trim: true, lowercase: true },
    image:       { type: String, default: '' },
    images:      { type: [String], default: [] },
    isActive:    { type: Boolean, default: true },

    // ── Featured ──────────────────────────────────────────────────────────────
    isFeatured:    { type: Boolean, default: false },
    featuredOrder: { type: Number,  default: 0 },

    reviews:       [reviewSchema],
    averageRating: { type: Number, default: 0 },
    numReviews:    { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.methods.updateRatingStats = function () {
  const reviews = this.reviews;
  if (reviews.length === 0) { this.averageRating = 0; this.numReviews = 0; return; }
  this.numReviews    = reviews.length;
  this.averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
};

productSchema.virtual('finalPrice').get(function () {
  return this.price - (this.price * this.discount) / 100;
});

productSchema.set('toJSON', { virtuals: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;

import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
      default: null,
    },
    name: {
      type:     String,
      required: [true, 'Name is required'],
      trim:     true,
    },
    email: {
      type:     String,
      required: [true, 'Email is required'],
      trim:     true,
      lowercase: true,
    },
    message: {
      type:     String,
      required: [true, 'Message is required'],
      trim:     true,
    },
    rating: {
      type:    Number,
      min:     1,
      max:     5,
      default: 5,
    },
    image: {
      type:    String,
      default: '',
    },
    status: {
      type:    String,
      enum:    ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);
// ✅ بعد
const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
export default Review;
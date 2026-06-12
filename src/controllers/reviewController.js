import Review      from '../models/Review.js';
import { getFileUrl } from '../middleware/upload.js';

// ─── CREATE REVIEW (public) ───────────────────────────────────────────────────
export const createReview = async (req, res, next) => {
  try {
    const { name, email, message, rating } = req.body;

    const data = {
      name, email, message,
      rating: rating || 5,
      user:   req.user?._id || null,
    };

    if (req.file) data.image = getFileUrl(req.file.filename);

    const review = await Review.create(data);
    res.status(201).json({ success: true, review });
  } catch (err) { next(err); }
};

// ─── GET APPROVED REVIEWS (public) ────────────────────────────────────────────
export const getApprovedReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ status: 'approved' }).sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) { next(err); }
};

// ─── ADMIN: GET ALL REVIEWS ───────────────────────────────────────────────────
export const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (err) { next(err); }
};

// ─── ADMIN: APPROVE ───────────────────────────────────────────────────────────
export const approveReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, review });
  } catch (err) { next(err); }
};

// ─── ADMIN: REJECT ────────────────────────────────────────────────────────────
export const rejectReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, review });
  } catch (err) { next(err); }
};

// ─── ADMIN: DELETE ────────────────────────────────────────────────────────────
export const deleteReview = async (req, res, next) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) { next(err); }
};

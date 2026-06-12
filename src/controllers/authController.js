import jwt  from 'jsonwebtoken';
import User from '../models/User.js';
import { notifyNewUser } from '../helpers/notificationHelper.js';
// ─── Helper ───────────────────────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const sendToken = (res, user, statusCode = 200) => {
  const token = signToken(user._id);
  const userObj = user.toObject();
  delete userObj.password;

  res.status(statusCode).json({
    success: true,
    token,
    user: userObj,
  });
};

// ─── REGISTER ─────────────────────────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { userName, email, password, phone, gender } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res
        .status(409)
        .json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ userName, email, password, phone, gender });
notifyNewUser(user);
    sendToken(res, user, 201);
  } catch (err) {
    next(err);
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password' });
    }

    sendToken(res, user);
  } catch (err) {
    next(err);
  }
};

// ─── GET ME (current user) ───────────────────────────────────────────────────
export const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────
export const updateProfile = async (req, res, next) => {
  try {
    const allowed = ['userName', 'phone', 'gender', 'address', 'avatar'];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new:          true,
      runValidators: true,
    });

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res
        .status(400)
        .json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    sendToken(res, user);
  } catch (err) {
    next(err);
  }
};

// ─── ADMIN: get all users ─────────────────────────────────────────────────────
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role))
      return res.status(400).json({ success: false, message: 'Invalid role' });

    const user = await User.findByIdAndUpdate(
      req.params.id, { role }, { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user });
  } catch (err) { next(err); }
};
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    userName: {
      type:     String,
      required: [true, 'Name is required'],
      trim:     true,
    },

    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
    },

    password: {
      type:     String,
      required: [true, 'Password is required'],
      minlength: 6,
      select:   false,  // never returned by default
    },

    phone: {
      type: String,
      trim: true,
    },

    gender: {
      type: String,
      enum: ['male', 'female', ''],
    },

    role: {
      type:    String,
      enum:    ['user', 'admin'],
      default: 'user',
    },

    avatar: {
      type:    String,
      default: '',
    },

    address: {
      type:    String,
      default: '',
    },
  },
  { timestamps: true }
);

// ─── Hash password before save ───────────────────────────────────────────────
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ─── Instance method ─────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;

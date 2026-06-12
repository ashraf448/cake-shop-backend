import mongoose from 'mongoose';

const heroSettingsSchema = new mongoose.Schema(
  {
    title:      { type: String, default: 'Delicious Cakes For Every Occasion 🎂' },
    subtitle:   { type: String, default: 'Freshly baked cakes with premium ingredients. Perfect for birthdays, weddings and more.' },
    badge:      { type: String, default: '20% OFF' },
    btnShop:    { type: String, default: 'Shop Now' },
    btnLearn:   { type: String, default: 'Learn More' },
    slides: {
      type: [{
        title: { type: String },
        image: { type: String },
      }],
      default: [],
    },
  },
  { timestamps: true }
);

// واحدة بس دايماً
const HeroSettings = mongoose.models.HeroSettings || mongoose.model('HeroSettings', heroSettingsSchema);
export default HeroSettings;

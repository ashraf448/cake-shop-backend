import mongoose from 'mongoose';

const offerSettingsSchema = new mongoose.Schema(
  {
    discount:     { type: Number, default: 20 },         // نسبة الخصم %
    durationHours:{ type: Number, default: 24 },         // مدة العرض بالساعات
    label:        { type: String, default: 'Offer Of The Day' },
    isActive:     { type: Boolean, default: true },
    expiresAt:    { type: Date, default: null },          // الأدمن يحدد وقت النهاية
  },
  { timestamps: true }
);

const OfferSettings = mongoose.models.OfferSettings || mongoose.model('OfferSettings', offerSettingsSchema);
export default OfferSettings;
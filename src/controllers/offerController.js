import OfferSettings from '../models/OfferSettings.js';

// ─── GET (public) ─────────────────────────────────────────────────────────────
export const getOfferSettings = async (req, res, next) => {
  try {
    let settings = await OfferSettings.findOne();
    if (!settings) {
      // لو مفيش settings، اعمل default
      const expiresAt = new Date(Date.now() + 24 * 3600000);
      settings = await OfferSettings.create({ expiresAt });
    }
    // لو انتهى الوقت، جدد تلقائياً
    if (settings.expiresAt && new Date() > settings.expiresAt) {
      settings.expiresAt = new Date(Date.now() + settings.durationHours * 3600000);
      await settings.save();
    }
    res.json({ success: true, settings });
  } catch (err) { next(err); }
};

// ─── UPDATE (admin) ───────────────────────────────────────────────────────────
export const updateOfferSettings = async (req, res, next) => {
  try {
    const { discount, durationHours, label, isActive, resetTimer } = req.body;

    let settings = await OfferSettings.findOne();
    if (!settings) settings = new OfferSettings();

    if (discount      !== undefined) settings.discount      = Number(discount);
    if (durationHours !== undefined) settings.durationHours = Number(durationHours);
    if (label         !== undefined) settings.label         = label;
    if (isActive      !== undefined) settings.isActive      = isActive;

    // لو الأدمن أراد reset للتايمر
    if (resetTimer) {
      settings.expiresAt = new Date(Date.now() + settings.durationHours * 3600000);
    }

    await settings.save();
    res.json({ success: true, settings });
  } catch (err) { next(err); }
};
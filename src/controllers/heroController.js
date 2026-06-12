import HeroSettings from '../models/HeroSettings.js';
import { getFileUrl } from '../middleware/upload.js';

// ─── GET (public) ─────────────────────────────────────────────────────────────
export const getHeroSettings = async (req, res, next) => {
  try {
    let settings = await HeroSettings.findOne();
    if (!settings) settings = await HeroSettings.create({});
    res.json({ success: true, settings });
  } catch (err) { next(err); }
};

// ─── UPDATE (admin) ───────────────────────────────────────────────────────────
export const updateHeroSettings = async (req, res, next) => {
  try {
    const { title, subtitle, badge, btnShop, btnLearn, slides } = req.body;

    let settings = await HeroSettings.findOne();
    if (!settings) settings = new HeroSettings();

    if (title    !== undefined) settings.title    = title;
    if (subtitle !== undefined) settings.subtitle = subtitle;
    if (badge    !== undefined) settings.badge    = badge;
    if (btnShop  !== undefined) settings.btnShop  = btnShop;
    if (btnLearn !== undefined) settings.btnLearn = btnLearn;
    if (slides   !== undefined) {
      try { settings.slides = typeof slides === 'string' ? JSON.parse(slides) : slides; }
      catch {}
    }

    // لو فيه صور مرفوعة للـ slides
    if (req.files && req.files.length > 0) {
      req.files.forEach((f, i) => {
        if (settings.slides[i]) settings.slides[i].image = getFileUrl(f.filename);
      });
    }

    await settings.save();
    res.json({ success: true, settings });
  } catch (err) { next(err); }
};

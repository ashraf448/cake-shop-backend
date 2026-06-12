import Notification from '../models/Notification.js';

// ─── GET ALL (admin) ──────────────────────────────────────────────────────────
export const getNotifications = async (req, res, next) => {
  try {
    const { limit = 50, page = 1, unread } = req.query;
    const filter = {};
    if (unread === 'true') filter.isRead = false;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Notification.countDocuments(filter);
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 }).skip(skip).limit(Number(limit));

    const unreadCount = await Notification.countDocuments({ isRead: false });

    res.json({ success: true, notifications, total, unreadCount });
  } catch (err) { next(err); }
};

// ─── MARK ONE AS READ ─────────────────────────────────────────────────────────
export const markAsRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (err) { next(err); }
};

// ─── MARK ALL AS READ ─────────────────────────────────────────────────────────
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (err) { next(err); }
};

// ─── DELETE ONE ───────────────────────────────────────────────────────────────
export const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
};

// ─── DELETE ALL READ ──────────────────────────────────────────────────────────
export const clearReadNotifications = async (req, res, next) => {
  try {
    await Notification.deleteMany({ isRead: true });
    res.json({ success: true });
  } catch (err) { next(err); }
};

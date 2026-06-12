import Notification from '../models/Notification.js';

// ── Helper عام ────────────────────────────────────────────────────────────────
export const createNotification = async (data) => {
  try {
    await Notification.create(data);
  } catch (err) {
    console.error('Notification creation failed:', err.message);
  }
};

// ── أوردر جديد ────────────────────────────────────────────────────────────────
export const notifyNewOrder = (order) =>
  createNotification({
    type:     'success',
    icon:     '🛒',
    title:    `New order placed`,
    desc:     `Order #${order._id.toString().slice(-6).toUpperCase()} · ${order.shippingAddress?.name} · EGP ${order.total?.toLocaleString()}`,
    link:     `/orders/${order._id}`,
    refModel: 'Order',
    refId:    order._id,
  });

// ── Payment proof رُفع ────────────────────────────────────────────────────────
export const notifyPaymentProof = (order) =>
  createNotification({
    type:     'info',
    icon:     '💳',
    title:    `New payment proof uploaded`,
    desc:     `Order #${order._id.toString().slice(-6).toUpperCase()} · ${order.shippingAddress?.name} · EGP ${order.total?.toLocaleString()}`,
    link:     `/orders/${order._id}`,
    refModel: 'Order',
    refId:    order._id,
  });

// ── أوردر اتكنسل ─────────────────────────────────────────────────────────────
export const notifyOrderCancelled = (order) =>
  createNotification({
    type:     'danger',
    icon:     '🚫',
    title:    `Order cancelled`,
    desc:     `Order #${order._id.toString().slice(-6).toUpperCase()} · ${order.shippingAddress?.name} · Stock restored`,
    link:     `/orders/${order._id}`,
    refModel: 'Order',
    refId:    order._id,
  });

// ── يوزر جديد ─────────────────────────────────────────────────────────────────
export const notifyNewUser = (user) =>
  createNotification({
    type:     'warning',
    icon:     '👤',
    title:    `New user registered`,
    desc:     `${user.userName} joined · ${user.phone || user.email}`,
    link:     `/users`,
    refModel: 'User',
    refId:    user._id,
  });

// ── Low stock ─────────────────────────────────────────────────────────────────
export const notifyLowStock = (product) =>
  createNotification({
    type:     'danger',
    icon:     '⚠️',
    title:    `Low stock alert: ${product.title}`,
    desc:     `Only ${product.stock} unit${product.stock !== 1 ? 's' : ''} remaining in ${product.category}`,
    link:     `/products`,
    refModel: 'Product',
    refId:    product._id,
  });

// ── Custom order جديد ─────────────────────────────────────────────────────────
export const notifyNewCustomOrder = (order, userName) =>
  createNotification({
    type:     'info',
    icon:     '🎂',
    title:    `New custom cake order`,
    desc:     `${userName} submitted a custom order: "${order.description?.slice(0, 50)}..."`,
    link:     `/custom-orders`,
    refModel: 'CustomOrder',
    refId:    order._id,
  });

// ── Custom order دُفع ─────────────────────────────────────────────────────────
export const notifyCustomOrderPaid = (order, userName) =>
  createNotification({
    type:     'success',
    icon:     '💚',
    title:    `Custom order payment received`,
    desc:     `${userName} paid EGP ${order.quotedPrice?.toLocaleString()} for custom cake order`,
    link:     `/custom-orders`,
    refModel: 'CustomOrder',
    refId:    order._id,
  });




import Order        from '../models/Order.js';
import Product      from '../models/Product.js';
import { getFileUrl } from '../middleware/upload.js';
import {
  notifyNewOrder, notifyPaymentProof,
  notifyOrderCancelled, notifyLowStock,
} from '../helpers/notificationHelper.js';

const calcSubtotal = (items) =>
  items.reduce((sum, item) => {
    const price = item.price - (item.price * item.discount) / 100;
    return sum + price * item.qty;
  }, 0);

const pushHistory = (order, status, note = '') => {
  if (order.statusHistory) order.statusHistory.push({ status, timestamp: new Date(), note });
};

// ─── CREATE ORDER ─────────────────────────────────────────────────────────────
export const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, expectedDelivery, termsAccepted } = req.body;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive)
        return res.status(400).json({ success: false, message: `Product ${item.title || item.product} not found` });
      if (product.stock < item.qty)
        return res.status(400).json({ success: false, message: `Insufficient stock for "${product.title}"` });
    }

    const shipping = 20;
    const subtotal = calcSubtotal(items);
    const total    = subtotal + shipping;

    const order = await Order.create({
      user: req.user._id, items, shippingAddress, paymentMethod, subtotal, shipping, total,
      expectedDelivery: expectedDelivery || null,
      termsAccepted:    termsAccepted    || false,
      statusHistory: [{ status: 'Pending', timestamp: new Date(), note: 'Order placed' }],
    });

    for (const item of items) {
      const updated = await Product.findByIdAndUpdate(
        item.product, { $inc: { stock: -item.qty } }, { new: true }
      );
      // low stock notification
      if (updated && updated.stock <= 5 && updated.stock > 0) {
        notifyLowStock(updated);
      }
    }

    // notification
    notifyNewOrder(order);

    res.status(201).json({ success: true, order });
  } catch (err) { next(err); }
};

// ─── GET MY ORDERS ────────────────────────────────────────────────────────────
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'title image');
    res.json({ success: true, count: orders.length, orders });
  } catch (err) { next(err); }
};

// ─── GET SINGLE ORDER ─────────────────────────────────────────────────────────
export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'title image');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Forbidden' });
    res.json({ success: true, order });
  } catch (err) { next(err); }
};

// ─── UPLOAD PAYMENT PROOF ─────────────────────────────────────────────────────
export const uploadPaymentProof = async (req, res, next) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: 'Payment proof image is required' });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Forbidden' });

    order.paymentProof = getFileUrl(req.file.filename);
    order.isPaid       = true;
    order.paidAt       = new Date();
    order.status       = 'Confirmed';
    pushHistory(order, 'Confirmed', 'Payment received and verified');
    await order.save();

    // notification
    notifyPaymentProof(order);

    res.json({ success: true, order });
  } catch (err) { next(err); }
};

// ─── CANCEL ORDER ─────────────────────────────────────────────────────────────
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Forbidden' });
    if (['Shipped', 'Delivered'].includes(order.status))
      return res.status(400).json({ success: false, message: 'Cannot cancel a shipped or delivered order' });

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty } });
    }

    order.status = 'Cancelled';
    pushHistory(order, 'Cancelled', 'Order cancelled');
    await order.save();

    // notification
    notifyOrderCancelled(order);

    res.json({ success: true, order });
  } catch (err) { next(err); }
};

// ─── TRACK ORDER ──────────────────────────────────────────────────────────────
export const trackOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
  .select('status createdAt paidAt shippingAddress paymentMethod user statusHistory items expectedDelivery isPaid total');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Forbidden' });

    const steps     = ['Pending', 'Confirmed', 'Preparing', 'Shipped', 'Delivered'];
    const stepIndex = order.status === 'Cancelled' ? -1 : steps.indexOf(order.status);

    const timeline = steps.map(step => {
      const entry = order.statusHistory?.find(h => h.status === step);
      return { step, done: stepIndex === -1 ? false : steps.indexOf(step) <= stepIndex, timestamp: entry?.timestamp || null, note: entry?.note || null };
    });

    res.json({
      success: true,
      tracking: {
        orderId: order._id, status: order.status, stepIndex, steps, timeline,
        createdAt: order.createdAt, paidAt: order.paidAt,
        expectedDelivery: order.expectedDelivery,
        isCancelled: order.status === 'Cancelled',
        shippingAddress: order.shippingAddress,
        itemCount: order.items?.length,
        total: order.total,

    paymentMethod: order.paymentMethod,

    expectedDelivery: order.expectedDelivery,
      },
    });
  } catch (err) { next(err); }
};

// ─── ADMIN: GET ALL ORDERS ────────────────────────────────────────────────────
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip   = (Number(page) - 1) * Number(limit);
    const total  = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 }).skip(skip).limit(Number(limit))
      .populate('user', 'userName email');

    res.json({ success: true, count: orders.length, total, pages: Math.ceil(total / Number(limit)), orders });
  } catch (err) { next(err); }
};

// ─── ADMIN: UPDATE STATUS ─────────────────────────────────────────────────────
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const allowed = ['Pending','Confirmed','Preparing','Shipped','Delivered','Cancelled'];
    if (!allowed.includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status' });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = status;
    pushHistory(order, status, note || '');
    await order.save();
    res.json({ success: true, order });
  } catch (err) { next(err); }
};

// ─── ADMIN: UPDATE EXPECTED DELIVERY DATE ─────────────────────────────────────
export const updateExpectedDelivery = async (req, res, next) => {
  try {
    const { expectedDelivery } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id, { expectedDelivery: new Date(expectedDelivery) }, { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) { next(err); }
};

// ─── USER: CONFIRM RECEIPT ────────────────────────────────────────────────────
export const confirmReceipt = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Forbidden' });
    if (order.status !== 'Shipped')
      return res.status(400).json({ success: false, message: 'Order is not shipped yet' });

    order.status = 'Delivered';
    pushHistory(order, 'Delivered', 'Confirmed by customer');
    await order.save();
    res.json({ success: true, order });
  } catch (err) { next(err); }
};

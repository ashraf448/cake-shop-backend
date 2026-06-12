import CustomOrder from '../models/CustomOrder.js';
import Order        from '../models/Order.js';
import { getFileUrl } from '../middleware/upload.js';
import { notifyNewCustomOrder, notifyCustomOrderPaid } from '../helpers/notificationHelper.js';
// ─── USER: Create ─────────────────────────────────────────────────────────────
export const createCustomOrder = async (req, res, next) => {
  try {
    const { description, size, flavor, layers, deliveryDate, phone, address } = req.body;
    const data = { user: req.user._id, description, size, flavor, layers, deliveryDate, phone, address };
    if (req.file) data.image = getFileUrl(req.file.filename);
    const order = await CustomOrder.create(data);
    notifyNewCustomOrder(order, req.user.userName);
    res.status(201).json({ success: true, order });
  } catch (err) { next(err); }
};

// ─── USER: My orders ──────────────────────────────────────────────────────────
export const getMyCustomOrders = async (req, res, next) => {
  try {
    const orders = await CustomOrder.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (err) { next(err); }
};

// ─── USER: Single ─────────────────────────────────────────────────────────────
export const getCustomOrder = async (req, res, next) => {
  try {
    const order = await CustomOrder.findById(req.params.id).populate('user', 'userName email phone');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Forbidden' });
    res.json({ success: true, order });
  } catch (err) { next(err); }
};

// ─── USER: Upload payment proof ───────────────────────────────────────────────
export const uploadCustomPaymentProof = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Payment proof image is required' });
    const order = await CustomOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Forbidden' });
    if (!order.quotedPrice) return res.status(400).json({ success: false, message: 'Price not set yet by admin' });
    order.paymentProof = getFileUrl(req.file.filename);
    order.paymentMethod = req.body.paymentMethod;
    order.isPaid = true; order.paidAt = new Date(); order.status = 'Paid';
    await order.save();
    notifyCustomOrderPaid(order, req.user.userName);
    res.json({ success: true, order });
  } catch (err) { next(err); }
};
// ─── USER: Accept quote ───────────────────────────────────────────────────────
export const acceptQuote = async (req, res, next) => {
  try {
    const order = await CustomOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Forbidden' });
    if (order.status !== 'Quoted') return res.status(400).json({ success: false, message: 'No quote to accept yet' });
    order.status = 'Accepted';
    await order.save();
    res.json({ success: true, order });
  } catch (err) { next(err); }
};

// ─── ADMIN: Get all ───────────────────────────────────────────────────────────
export const getAllCustomOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const total = await CustomOrder.countDocuments(filter);
    const orders = await CustomOrder.find(filter)
      .sort({ createdAt: -1 }).skip(skip).limit(Number(limit))
      .populate('user', 'userName email phone');
    res.json({ success: true, count: orders.length, total, orders });
  } catch (err) { next(err); }
};

// ─── ADMIN: Set price ─────────────────────────────────────────────────────────
export const setQuotePrice = async (req, res, next) => {
  try {
    const { quotedPrice, adminNote } = req.body;
    if (!quotedPrice || quotedPrice <= 0) return res.status(400).json({ success: false, message: 'Valid price is required' });
    const order = await CustomOrder.findByIdAndUpdate(
      req.params.id, { quotedPrice, adminNote: adminNote || '', status: 'Quoted' }, { new: true }
    ).populate('user', 'userName email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) { next(err); }
};

// ─── ADMIN: Update status ─────────────────────────────────────────────────────
// لما status بيبقى Preparing → يتعمل Order عادي يظهر في MyOrders والـ Analytics
export const updateCustomOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['Pending','Quoted','Accepted','Paid','Preparing','Delivered','Cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });

    const customOrder = await CustomOrder.findById(req.params.id).populate('user', 'userName email');
    if (!customOrder) return res.status(404).json({ success: false, message: 'Order not found' });

    customOrder.status = status;

    // ── Preparing → ابعت للـ Orders عشان يظهر في MyOrders والـ Analytics ────────
    if (status === 'Preparing' && customOrder.isPaid && !customOrder.linkedOrderId) {
      try {
        const linkedOrder = await Order.create({
          user: customOrder.user._id,
          items: [{
            product:  '000000000000000000000000', // placeholder ObjectId
            title:    `🎂 Custom Cake - ${customOrder.description?.slice(0, 40)}`,
            image:    customOrder.image || '',
            price:    customOrder.quotedPrice,
            discount: 0,
            qty:      1,
          }],
          shippingAddress: {
            name:    customOrder.user.userName,
            phone:   customOrder.phone   || '—',
            address: customOrder.address || '—',
          },
          paymentMethod: 'instapay',
          paymentProof:  customOrder.paymentProof || '',
          isPaid:        true,
          paidAt:        customOrder.paidAt,
          status:        'Preparing',
          subtotal:      customOrder.quotedPrice,
          shipping:      0,
          total:         customOrder.quotedPrice,
          isCustomOrder: true,
          customOrderRef: customOrder._id,
          statusHistory: [
            { status:'Pending',   timestamp: customOrder.createdAt, note:'Custom order placed' },
            { status:'Confirmed', timestamp: customOrder.paidAt,    note:'Payment verified' },
            { status:'Preparing', timestamp: new Date(),            note:'Custom order being prepared' },
          ],
        });
        customOrder.linkedOrderId = linkedOrder._id;
      } catch (e) {
        console.error('Linked order creation failed:', e.message);
      }
    }

    // ── Delivered → حدّث الـ linked order كمان ────────────────────────────────
    if (status === 'Delivered' && customOrder.linkedOrderId) {
      await Order.findByIdAndUpdate(customOrder.linkedOrderId, {
        status: 'Delivered',
        $push: { statusHistory: { status:'Delivered', timestamp: new Date(), note:'Custom order delivered' } },
      });
    }

    // ── Cancelled → حدّث الـ linked order كمان ───────────────────────────────
    if (status === 'Cancelled' && customOrder.linkedOrderId) {
      await Order.findByIdAndUpdate(customOrder.linkedOrderId, {
        status: 'Cancelled',
        $push: { statusHistory: { status:'Cancelled', timestamp: new Date(), note:'Custom order cancelled' } },
      });
    }

    await customOrder.save();
    res.json({ success: true, order: customOrder });
  } catch (err) { next(err); }
};

export const confirmDelivery = async (
  req,
  res,
  next
) => {
  try {

    const order = await CustomOrder.findById(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (
      order.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
      });
    }

    order.received = true;

    await order.save();

    res.json({
      success: true,
      order,
    });

  } catch (err) {
    next(err);
  }
};
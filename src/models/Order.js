
import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref:'Product', required:true },
  title:    { type: String,  required: true },
  image:    { type: String },
  price:    { type: Number,  required: true },
  discount: { type: Number,  default: 0 },
  qty:      { type: Number,  required: true, min: 1 },
});

const statusHistorySchema = new mongoose.Schema({
  status:    { type: String, required: true },
  timestamp: { type: Date,   default: Date.now },
  note:      { type: String, default: '' },
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref:'User', required: true },
    items: [orderItemSchema],

    shippingAddress: {
      name:    { type: String, required: true },
      phone:   { type: String, required: true },
      address: { type: String, required: true },
    },

    paymentMethod: {
      type: String,
      enum: ['instapay','vodafone'],
      required: true,
    },

    paymentProof: { type: String,  default: '' },
    isPaid:       { type: Boolean, default: false },
    paidAt:       { type: Date },

    status: {
      type:    String,
      enum:    ['Pending','Confirmed','Preparing','Shipped','Delivered','Cancelled'],
      default: 'Pending',
    },

    statusHistory: { type: [statusHistorySchema], default: [] },

    // ── تواريخ التسليم ────────────────────────────────────────────────────────
    expectedDelivery: { type: Date, default: null },  // التاريخ المتوقع (قابل للتعديل من الأدمن)
    actualDelivery:   { type: Date, default: null },  // التاريخ الفعلي

    // ── الموافقة على الشروط ───────────────────────────────────────────────────
    termsAccepted: { type: Boolean, default: false },

    // ── Custom order link ─────────────────────────────────────────────────────
    isCustomOrder:  { type: Boolean, default: false },
    customOrderRef: { type: mongoose.Schema.Types.ObjectId, ref:'CustomOrder', default: null },

    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 20 },
    total:    { type: Number, required: true },
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
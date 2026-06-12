import mongoose from 'mongoose';

const customOrderSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: [true, 'Description is required'], trim: true },
    size:        { type: String, trim: true },
    flavor:      { type: String, trim: true },
    layers:      { type: Number, default: 1 },
    deliveryDate:{ type: Date },
    image:       { type: String, default: '' },
    phone:       { type: String, trim: true },
    address:     { type: String, trim: true },
    quotedPrice: { type: Number, default: null },
    adminNote:   { type: String, default: '' },
    status: {
      type:    String,
      enum:    ['Pending','Quoted','Accepted','Paid','Preparing','Delivered','Cancelled'],
      default: 'Pending',
    },
    paymentMethod: {
  type: String,
},

received: {
  type: Boolean,
  default: false,
},
    isPaid:       { type: Boolean, default: false },
    paymentProof: { type: String,  default: '' },
    paidAt:       { type: Date },
    // لما الأدمن يبدأ التحضير بيتعمل Order عادي ويتربط هنا
    linkedOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
  },
  { timestamps: true }
);

export default mongoose.model('CustomOrder', customOrderSchema);

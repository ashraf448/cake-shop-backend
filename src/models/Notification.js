import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    type:    { type:String, enum:['danger','info','success','warning'], default:'info' },
    icon:    { type:String, default:'🔔' },
    title:   { type:String, required:true, trim:true },
    desc:    { type:String, default:'' },
    link:    { type:String, default:'' },  // رابط للصفحة المرتبطة
    isRead:  { type:Boolean, default:false },
    // مرتبط بإيه
    refModel: { type:String, enum:['Order','CustomOrder','User','Product',''], default:'' },
    refId:    { type:mongoose.Schema.Types.ObjectId, default:null },
  },
  { timestamps: true }
);

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
export default Notification;

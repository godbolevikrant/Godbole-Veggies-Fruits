const mongoose = require('mongoose');

const pendingBillItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 }
});

const pendingBillSchema = new mongoose.Schema({
  customerName: { type: String, required: true, trim: true },
  date: { type: Date, default: Date.now },
  discount: { type: Number, default: 0 },
  deliveryCharges: { type: Number, default: 0 },
  outstanding: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  items: { type: [pendingBillItemSchema], default: [] },
  note: { type: String, default: '' },
  phone: { type: String, default: '' },
  paidAt: { type: Date, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
});

// Indexes for common queries
pendingBillSchema.index({ date: -1 });
pendingBillSchema.index({ status: 1, date: -1 });
pendingBillSchema.index({ customerName: 1 });

module.exports = mongoose.model('PendingBill', pendingBillSchema);

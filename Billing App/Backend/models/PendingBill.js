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
  outstanding: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  items: { type: [pendingBillItemSchema], default: [] },
  note: { type: String, default: '' }
});

module.exports = mongoose.model('PendingBill', pendingBillSchema);

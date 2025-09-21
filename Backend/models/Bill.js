const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  quantity: Number,
  price: Number,
});

const billSchema = new mongoose.Schema({
  customerName: String,
  items: [billItemSchema],
  subtotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  deliveryCharges: { type: Number, default: 0 },
  total: { type: Number, default: 0 }, // after discount + delivery
  outstanding: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 }, // total + outstanding
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Bill', billSchema);

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
  discount: { type: Number, default: 0 }, 
  total: Number,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Bill', billSchema);
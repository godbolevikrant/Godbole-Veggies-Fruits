const mongoose = require('mongoose');

const manualEntrySchema = new mongoose.Schema({
  amount: { type: Number, required: true, min: 0 },
  type: { type: String, enum: ['sale', 'expense'], required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ManualEntry', manualEntrySchema);

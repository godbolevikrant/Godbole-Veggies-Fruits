const mongoose = require("mongoose");

const ManualEntrySchema = new mongoose.Schema({
  type: { type: String, enum: ["sale", "expense"], required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ManualEntry", ManualEntrySchema);

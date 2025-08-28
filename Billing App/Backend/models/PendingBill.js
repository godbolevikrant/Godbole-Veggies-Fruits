const mongoose = require("mongoose");

const pendingBillSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  date: { type: Date, required: true },
  outstanding: { type: Number, required: true },
  status: { type: String, enum: ["pending", "paid"], default: "pending" },
});

module.exports = mongoose.model("PendingBill", pendingBillSchema);

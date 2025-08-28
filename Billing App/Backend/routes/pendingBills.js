const express = require("express");
const router = express.Router();
const PendingBill = require("../models/PendingBill");

// GET all pending bills
router.get("/", async (req, res) => {
  try {
    const bills = await PendingBill.find().sort({ date: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new pending bill
router.post("/", async (req, res) => {
  try {
    const bill = new PendingBill(req.body);
    const savedBill = await bill.save();
    res.status(201).json(savedBill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a bill
router.delete("/:id", async (req, res) => {
  try {
    const bill = await PendingBill.findByIdAndDelete(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }
    res.json({ message: "Bill deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const ManualEntry = require("../models/ManualEntry");

// GET all manual entries
router.get("/", async (req, res) => {
  try {
    const entries = await ManualEntry.find().sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add a new entry
router.post("/", async (req, res) => {
  try {
    const { type, amount } = req.body;
    if (!type || !amount) return res.status(400).json({ error: "Missing fields" });

    const newEntry = new ManualEntry({ type, amount });
    await newEntry.save();
    res.json(newEntry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE entry
router.delete("/:id", async (req, res) => {
  try {
    await ManualEntry.findByIdAndDelete(req.params.id);
    res.json({ message: "Entry deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

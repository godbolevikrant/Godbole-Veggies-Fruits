const express = require('express');
const Bill = require('../models/Bill');
const router = express.Router();

// Get all bills
router.get('/', async (req, res) => {
  const bills = await Bill.find().sort({ date: -1 });
  res.json(bills);
});

// Add a bill
router.post('/', async (req, res) => {
  const bill = new Bill(req.body);
  await bill.save();
  res.status(201).json(bill);
});

// Delete a bill
router.delete('/:id', async (req, res) => {
  try {
    const bill = await Bill.findByIdAndDelete(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    res.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

const express = require('express');
const Bill = require('../models/Bill');
const router = express.Router();

// Get all bills
router.get('/', async (req, res) => {
  try {
    const bills = await Bill.find().sort({ date: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a bill
router.post('/', async (req, res) => {
  try {
    const {
      customerName,
      items,
      subtotal,
      discount = 0,
      deliveryCharges = 0,
      total,
      outstanding = 0,
      grandTotal,
      date
    } = req.body;

    const bill = new Bill({
      customerName,
      items,
      subtotal,
      discount,
      deliveryCharges,
      total,
      outstanding,
      grandTotal,
      date: date || Date.now()
    });

    await bill.save();
    res.status(201).json(bill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
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

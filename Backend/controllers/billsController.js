const Bill = require('../models/Bill');

exports.getBills = async (req, res, next) => {
  try {
    const bills = await Bill.find().sort({ date: -1 }).lean();
    res.json(bills);
  } catch (error) {
    next(error);
  }
};

exports.createBill = async (req, res, next) => {
  try {
    const { customerName, items, discount = 0, deliveryCharges = 0, outstanding = 0, date } = req.body;
    if (!customerName || typeof customerName !== 'string') {
      return res.status(400).json({ success: false, error: 'customerName is required' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'items must be a non-empty array' });
    }
    let subtotal = 0;
    for (const item of items) {
      const { name, quantity, price } = item;
      if (!name || typeof name !== 'string') return res.status(400).json({ success: false, error: 'each item requires a valid name' });
      if (typeof quantity !== 'number' || quantity <= 0) return res.status(400).json({ success: false, error: 'each item requires quantity > 0' });
      if (typeof price !== 'number' || price < 0) return res.status(400).json({ success: false, error: 'each item requires non-negative price' });
      subtotal += quantity * price;
    }
    const total = subtotal - (discount || 0) + (deliveryCharges || 0);
    const grandTotal = total + (outstanding || 0);

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
    next(error);
  }
};

exports.deleteBill = async (req, res, next) => {
  try {
    const bill = await Bill.findByIdAndDelete(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    res.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    next(error);
  }
};



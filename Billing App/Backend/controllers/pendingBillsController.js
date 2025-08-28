const PendingBill = require('../models/PendingBill');

exports.getPendingBills = async (req, res, next) => {
  try {
    const bills = await PendingBill.find().sort({ date: -1 }).lean();
    res.json(bills);
  } catch (err) { next(err); }
};

exports.createPendingBill = async (req, res, next) => {
  try {
    const { customerName, date, outstanding = 0, status = 'pending', items = [], note = '' } = req.body;
    if (!customerName || typeof customerName !== 'string') return res.status(400).json({ error: 'customerName is required' });
    if (typeof outstanding !== 'number' || outstanding < 0) return res.status(400).json({ error: 'outstanding must be non-negative number' });
    if (!['pending', 'paid'].includes(status)) return res.status(400).json({ error: 'status must be pending or paid' });
    const bill = new PendingBill({ customerName, date: date || Date.now(), outstanding, status, items, note });
    await bill.save();
    res.status(201).json(bill);
  } catch (err) { next(err); }
};

exports.updatePendingBill = async (req, res, next) => {
  try {
    const update = req.body || {};
    const bill = await PendingBill.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!bill) return res.status(404).json({ error: 'Pending bill not found' });
    res.json(bill);
  } catch (err) { next(err); }
};

exports.deletePendingBill = async (req, res, next) => {
  try {
    const deleted = await PendingBill.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Pending bill not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
};



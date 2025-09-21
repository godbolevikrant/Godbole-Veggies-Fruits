const ManualEntry = require('../models/ManualEntry');

exports.getManualEntries = async (req, res, next) => {
  try {
    const entries = await ManualEntry.find().sort({ date: -1 }).lean();
    res.json(entries);
  } catch (err) { next(err); }
};

exports.createManualEntry = async (req, res, next) => {
  try {
    const { amount, type, date } = req.body;
    if (typeof amount !== 'number' || amount < 0) return res.status(400).json({ error: 'amount must be non-negative number' });
    if (!['sale', 'expense'].includes(type)) return res.status(400).json({ error: 'type must be sale or expense' });
    const entry = new ManualEntry({ amount, type, date: date || Date.now() });
    await entry.save();
    res.status(201).json(entry);
  } catch (err) { next(err); }
};

exports.deleteManualEntry = async (req, res, next) => {
  try {
    const deleted = await ManualEntry.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Entry not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
};



const PendingBill = require('../models/PendingBill');
const Bill = require('../models/Bill');

exports.getPendingBills = async (req, res, next) => {
  try {
    const { status, from, to, q, skip = 0, limit = 100 } = req.query;
    const filter = {};
    if (status && ['pending', 'paid'].includes(status)) filter.status = status;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        // include the whole day for 'to'
        end.setHours(23,59,59,999);
        filter.date.$lte = end;
      }
    }
    if (q) {
      filter.customerName = { $regex: q, $options: 'i' };
    }

    const numericSkip = Math.max(parseInt(skip, 10) || 0, 0);
    const numericLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 500);

    const [bills, total] = await Promise.all([
      PendingBill.find(filter).sort({ date: -1 }).skip(numericSkip).limit(numericLimit).lean(),
      PendingBill.countDocuments(filter)
    ]);
    res.json({ items: bills, total, skip: numericSkip, limit: numericLimit });
  } catch (err) { next(err); }
};

exports.createPendingBill = async (req, res, next) => {
  try {
    const { customerName, date, discount = 0, deliveryCharges = 0, outstanding = 0, status = 'pending', items = [], note = '', phone = '', createdBy = null } = req.body;
    if (!customerName || typeof customerName !== 'string') return res.status(400).json({ error: 'customerName is required' });
    if (typeof discount !== 'number' || discount < 0) return res.status(400).json({ error: 'discount must be non-negative number' });
    if (typeof deliveryCharges !== 'number' || deliveryCharges < 0) return res.status(400).json({ error: 'deliveryCharges must be non-negative number' });
    if (typeof outstanding !== 'number' || outstanding < 0) return res.status(400).json({ error: 'outstanding must be non-negative number' });
    if (!['pending', 'paid'].includes(status)) return res.status(400).json({ error: 'status must be pending or paid' });
    if (note && String(note).length > 1000) return res.status(400).json({ error: 'note too long' });
    const parsedDate = date ? new Date(date) : new Date();
    if (isNaN(parsedDate.getTime())) return res.status(400).json({ error: 'invalid date' });
    if (items && !Array.isArray(items)) return res.status(400).json({ error: 'items must be an array' });
    if (Array.isArray(items)) {
      for (const it of items) {
        if (!it || typeof it !== 'object') return res.status(400).json({ error: 'invalid item' });
        if (!it.name || typeof it.name !== 'string') return res.status(400).json({ error: 'item.name required' });
        const qty = Number(it.quantity);
        const price = Number(it.price);
        if (!Number.isFinite(qty) || qty <= 0) return res.status(400).json({ error: 'item.quantity must be > 0' });
        if (!Number.isFinite(price) || price < 0) return res.status(400).json({ error: 'item.price must be >= 0' });
      }
    }
    const bill = new PendingBill({ customerName, date: parsedDate, discount, deliveryCharges, outstanding, status, items, note, phone, createdBy });
    await bill.save();
    res.status(201).json(bill);
  } catch (err) { next(err); }
};

exports.updatePendingBill = async (req, res, next) => {
  try {
    const update = req.body || {};
    if (update.date) {
      const d = new Date(update.date);
      if (isNaN(d.getTime())) return res.status(400).json({ error: 'invalid date' });
      update.date = d;
    }
    if (update.note && String(update.note).length > 1000) return res.status(400).json({ error: 'note too long' });
    if (update.status && !['pending', 'paid'].includes(update.status)) return res.status(400).json({ error: 'invalid status' });
    if (update.outstanding != null) {
      const o = Number(update.outstanding);
      if (!Number.isFinite(o) || o < 0) return res.status(400).json({ error: 'outstanding must be non-negative number' });
      update.outstanding = o;
    }
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

exports.markPendingBillPaid = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pending = await PendingBill.findById(id);
    if (!pending) return res.status(404).json({ error: 'Pending bill not found' });

    // Mark as paid (for audit, though we will delete after promotion)
    pending.status = 'paid';
    pending.paidAt = new Date();
    await pending.save();

    // Compute totals from pending items
    const subtotal = (pending.items || []).reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0);
    const discount = Number(pending.discount) || 0;
    const deliveryCharges = Number(pending.deliveryCharges) || 0;
    const total = subtotal - discount + deliveryCharges;
    const outstanding = Number(pending.outstanding) || 0;
    const grandTotal = total + outstanding;

    // Promote to finalized Bill (History uses this collection)
    const bill = new Bill({
      customerName: pending.customerName,
      items: (pending.items || []).map(it => ({
        productId: it.productId || undefined,
        name: it.name,
        quantity: it.quantity,
        price: it.price,
      })),
      subtotal,
      discount,
      deliveryCharges,
      total,
      outstanding,
      grandTotal,
      date: pending.date || new Date(),
    });
    await bill.save();

    // Remove the pending entry after promotion
    await PendingBill.findByIdAndDelete(id);

    // Return the created bill for clients that want it
    res.json({ success: true, promotedBill: bill });
  } catch (err) { next(err); }
};



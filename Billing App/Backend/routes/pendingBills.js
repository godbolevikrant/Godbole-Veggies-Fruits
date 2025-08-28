const express = require('express');
const router = express.Router();
const {
  getPendingBills,
  createPendingBill,
  updatePendingBill,
  deletePendingBill,
  markPendingBillPaid
} = require('../controllers/pendingBillsController');

router.get('/', getPendingBills);
router.post('/', createPendingBill);
router.put('/:id', updatePendingBill);
router.delete('/:id', deletePendingBill);
router.post('/:id/mark-paid', markPendingBillPaid);

module.exports = router;

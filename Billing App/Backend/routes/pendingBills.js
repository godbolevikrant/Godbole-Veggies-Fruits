const express = require('express');
const router = express.Router();
const {
  getPendingBills,
  createPendingBill,
  updatePendingBill,
  deletePendingBill
} = require('../controllers/pendingBillsController');

router.get('/', getPendingBills);
router.post('/', createPendingBill);
router.put('/:id', updatePendingBill);
router.delete('/:id', deletePendingBill);

module.exports = router;

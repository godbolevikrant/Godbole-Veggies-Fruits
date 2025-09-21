const express = require('express');
const router = express.Router();
const { getBills, createBill, deleteBill } = require('../controllers/billsController');

// Get all bills
router.get('/', getBills);

// Add a bill
router.post('/', createBill);

// Delete a bill
router.delete('/:id', deleteBill);

module.exports = router;

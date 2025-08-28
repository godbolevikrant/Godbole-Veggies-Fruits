const express = require('express');
const router = express.Router();
const {
  getManualEntries,
  createManualEntry,
  deleteManualEntry
} = require('../controllers/manualEntriesController');

router.get('/', getManualEntries);
router.post('/', createManualEntry);
router.delete('/:id', deleteManualEntry);

module.exports = router;

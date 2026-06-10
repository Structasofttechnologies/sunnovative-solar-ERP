const express = require('express');
const router  = express.Router();
const {
  getCalendarSlots, addCalendarSlot, addBulkSlots,
  updateCalendarSlot, deleteCalendarSlot, getAvailableSlots,
} = require('../controllers/epcCalendarController');
const { protectEpc } = require('../middleware/protectEpc');

// Public route - for customer website
router.get('/available', getAvailableSlots);

// Protected routes
router.get   ('/',      protectEpc, getCalendarSlots);
router.post  ('/',      protectEpc, addCalendarSlot);
router.post  ('/bulk',  protectEpc, addBulkSlots);
router.put   ('/:id',   protectEpc, updateCalendarSlot);
router.delete('/:id',   protectEpc, deleteCalendarSlot);

module.exports = router;
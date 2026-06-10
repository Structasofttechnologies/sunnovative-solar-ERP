const express = require('express');
const router  = express.Router();
const { getMyEnquiries, getEnquiryById, acceptEnquiry, convertToOrder } = require('../controllers/epcEnquiryController');
const { protectEpc } = require('../middleware/protectEpc');

// TEMP - test ke liye, baad mein hatao
router.post('/create-test', async (req, res) => {
  try {
    const EpcEnquiry = require('../models/EpcEnquiry');
    const enquiry = await EpcEnquiry.create(req.body);
    res.status(201).json(enquiry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get ('/',                  protectEpc, getMyEnquiries);
router.get ('/:id',               protectEpc, getEnquiryById);
router.put ('/:id/accept',        protectEpc, acceptEnquiry);
router.post('/:id/convert-order', protectEpc, convertToOrder);

module.exports = router;
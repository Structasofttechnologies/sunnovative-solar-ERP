const express = require('express');
const router  = express.Router();
const { getAllPlans, getMyPlan, requestUpgrade } = require('../controllers/epcPlanController');
const { protectEpc } = require('../middleware/protectEpc');

// IMPORTANT: /my-plan must be BEFORE /:id if you add one later
router.get ('/',        getAllPlans);           // Public
router.get ('/my-plan', protectEpc, getMyPlan);
router.post('/upgrade', protectEpc, requestUpgrade);

module.exports = router;
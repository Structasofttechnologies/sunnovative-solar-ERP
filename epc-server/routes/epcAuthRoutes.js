// ── epcAuthRoutes.js ──────────────────────────────────────────────────────────
const express = require('express');
const router  = express.Router();
const { registerEpc, loginEpc, getEpcProfile, updateEpcProfile } = require('../controllers/epcAuthController');
const { protectEpc } = require('../middleware/protectEpc');

router.post('/register', registerEpc);
router.post('/login',    loginEpc);
router.get ('/profile',  protectEpc, getEpcProfile);
router.put ('/profile',  protectEpc, updateEpcProfile);

module.exports = router;
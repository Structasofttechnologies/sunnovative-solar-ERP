const express = require('express');
const router  = express.Router();
const { getTeamMembers, addTeamMember, updateTeamMember, removeTeamMember } = require('../controllers/epcTeamController');
const { protectEpc } = require('../middleware/protectEpc');

router.get   ('/',    protectEpc, getTeamMembers);
router.post  ('/',    protectEpc, addTeamMember);
router.put   ('/:id', protectEpc, updateTeamMember);
router.delete('/:id', protectEpc, removeTeamMember);

module.exports = router;
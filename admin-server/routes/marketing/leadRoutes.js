import express from 'express';
import {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
  getLeadsByProject,
  assignLead,
  uploadLeads,
  getAnalytics,
} from '../../controllers/marketing/leadController.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/analytics', getAnalytics);
router.get('/project/:slug', getLeadsByProject);
router.post('/assign/:id', assignLead);
router.post('/upload', uploadLeads);

router.route('/')
  .get(getAllLeads)
  .post(createLead);

router.route('/:id')
  .get(getLeadById)
  .put(updateLead)
  .delete(deleteLead);

export default router;
const express = require('express');
const router  = express.Router();

const {
  getAllProjects,
  getProjectById,
  updateProjectStage,
  uploadProjectDocs,
  uploadInstallationPhotos,
  uploadPcrReport,
} = require('../controllers/epcProjectController');

const { protectEpc } = require('../middleware/protectEpc');

// IMPORTANT: specific routes pehle, :id baad mein
router.get ('/',                        protectEpc, getAllProjects);
router.get ('/:id',                     protectEpc, getProjectById);
router.put ('/:id/stage',               protectEpc, updateProjectStage);
router.post('/:id/upload-docs',         protectEpc, uploadProjectDocs);
router.post('/:id/upload-installation', protectEpc, uploadInstallationPhotos);
router.post('/:id/upload-pcr',          protectEpc, uploadPcrReport);

module.exports = router;
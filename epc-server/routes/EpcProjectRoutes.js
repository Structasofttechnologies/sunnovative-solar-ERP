const express = require('express');
const router  = express.Router();
const upload  = require('../middleware/multer'); // Multer import kiya

const {
  getAllProjects,
  getProjectById,
  updateProjectStage,
  uploadProjectDocs,
  uploadInstallationPhotos,
  uploadPcrReport,
} = require('../controllers/epcProjectController');

const { protectEpc } = require('../middleware/protectEpc');

// Routes
router.get ('/',                        protectEpc, getAllProjects);
router.get ('/:id',                     protectEpc, getProjectById);
router.put ('/:id/stage',               protectEpc, updateProjectStage);

// 1. Multiple files ke liye (registrationDocs)
router.post('/:id/upload-docs',         protectEpc, upload.array('files', 10), uploadProjectDocs);

// 2. Mix fields ke liye (photos aur net metering doc)
router.post('/:id/upload-installation', protectEpc, upload.fields([
  { name: 'photos', maxCount: 10 },
  { name: 'netMetering', maxCount: 1 }
]), uploadInstallationPhotos);

// 3. Single file ke liye (PCR Report)
router.post('/:id/upload-pcr',          protectEpc, upload.single('pcrReport'), uploadPcrReport);

module.exports = router;
const express = require('express');
const router  = express.Router();
const {
  getOrderSummary, getMyOrders, getOrderById,
  updateOrderStage, uploadRegistrationDocs,
  uploadInstallationDocs, uploadPcr,
} = require('../controllers/epcOrderController');
const { protectEpc, requireVerified } = require('../middleware/protectEpc');
const upload = require('../middleware/upload'); // 👈 ADD THIS

// IMPORTANT: /summary must be BEFORE /:id
router.get('/summary',            protectEpc, getOrderSummary);
router.get('/',                   protectEpc, getMyOrders);
router.get('/:id',                protectEpc, getOrderById);
router.put('/:id/stage',          protectEpc, updateOrderStage);


// ✅ Upload Registration Docs
router.post(
  '/:id/upload-docs',
  protectEpc,
  requireVerified,
  upload.array('file', 10), // 👈 multiple files
  uploadRegistrationDocs
);
// ✅ Upload Installation Docs (photos + netMetering)
router.post(
  '/:id/upload-install',
  protectEpc,
  requireVerified,
  upload.fields([
    { name: 'photos', maxCount: 10 },
    { name: 'netMetering', maxCount: 1 }
  ]),
  uploadInstallationDocs
);

// ✅ Upload PCR
router.post(
  '/:id/upload-pcr',
  protectEpc,
  requireVerified,
  upload.single('pcr'),
  uploadPcr
);

module.exports = router;
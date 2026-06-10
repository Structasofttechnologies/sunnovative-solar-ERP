const express = require('express');
const router  = express.Router();
const {
  getOrderSummary, getMyOrders, getOrderById,
  updateOrderStage, uploadRegistrationDocs,
  uploadInstallationDocs, uploadPcr,
} = require('../controllers/epcOrderController');
const { protectEpc } = require('../middleware/protectEpc');

// IMPORTANT: /summary must be BEFORE /:id
router.get('/summary',            protectEpc, getOrderSummary);
router.get('/',                   protectEpc, getMyOrders);
router.get('/:id',                protectEpc, getOrderById);
router.put('/:id/stage',          protectEpc, updateOrderStage);
router.post('/:id/upload-docs',   protectEpc, uploadRegistrationDocs);
router.post('/:id/upload-install',protectEpc, uploadInstallationDocs);
router.post('/:id/upload-pcr',    protectEpc, uploadPcr);

module.exports = router;
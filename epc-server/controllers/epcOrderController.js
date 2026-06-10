const EpcOrder = require('../models/EpcOrder');

const stageSteps = ['Order Created', 'Installation Pending', 'Net Metering', 'PCR Reports', 'Completed'];

// GET /api/epc/orders/summary  ← must be before /:id route
const getOrderSummary = async (req, res) => {
  try {
    const epcId = req.epc._id;
    const [total, newOrders, ongoing, overdue, completed] = await Promise.all([
      EpcOrder.countDocuments({ epcPartner: epcId }),
      EpcOrder.countDocuments({ epcPartner: epcId, status: 'New' }),
      EpcOrder.countDocuments({ epcPartner: epcId, status: 'Ongoing' }),
      EpcOrder.countDocuments({ epcPartner: epcId, status: 'Overdue' }),
      EpcOrder.countDocuments({ epcPartner: epcId, status: 'Completed' }),
    ]);
    res.json({ total, new: newOrders, ongoing, overdue, completed });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/epc/orders
// Document: New, Ongoing, Overdue - order status as set by admin
const getMyOrders = async (req, res) => {
  try {
    const { status, stage, projectType, district } = req.query;
    const filter = { epcPartner: req.epc._id };

    if (status)      filter.status      = status;
    if (stage)       filter.stage       = stage;
    if (projectType) filter.projectType = projectType;
    if (district)    filter.district    = district;

    const orders = await EpcOrder.find(filter).sort({ createdAt: -1 });
    const summary = {
      total:     orders.length,
      new:       orders.filter(o => o.status === 'New').length,
      ongoing:   orders.filter(o => o.status === 'Ongoing').length,
      overdue:   orders.filter(o => o.status === 'Overdue').length,
      completed: orders.filter(o => o.status === 'Completed').length,
    };
    res.json({ orders, summary });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/epc/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await EpcOrder.findOne({ _id: req.params.id, epcPartner: req.epc._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/epc/orders/:id/stage
// Document: Order Created → Installation Pending → Net Metering → PCR Reports → Completed
const updateOrderStage = async (req, res) => {
  try {
    const order = await EpcOrder.findOne({ _id: req.params.id, epcPartner: req.epc._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const { stage } = req.body;
    if (!stageSteps.includes(stage))
      return res.status(400).json({ message: 'Invalid stage' });

    const currentIdx = stageSteps.indexOf(order.stage);
    const newIdx     = stageSteps.indexOf(stage);
    if (newIdx <= currentIdx)
      return res.status(400).json({ message: 'Cannot go back to a previous stage' });

    order.stage = stage;
    if (stage === 'Installation Pending') order.status = 'Ongoing';
    if (stage === 'Completed') {
      order.status             = 'Completed';
      order.installCompletedAt = new Date();
    }

    await order.save();
    res.json({ message: `Order moved to: ${stage}`, order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/epc/orders/:id/upload-docs  (Step 4 - MNRE/registration)
const uploadRegistrationDocs = async (req, res) => {
  try {
    const order = await EpcOrder.findOne({ _id: req.params.id, epcPartner: req.epc._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: 'No files uploaded' });

    const newDocs = req.files.map(f => ({
      docName: f.originalname,
      fileUrl: f.path,
      uploadedAt: new Date(),
    }));
    order.registrationDocs.push(...newDocs);
    await order.save();
    res.json({ message: 'Documents uploaded', registrationDocs: order.registrationDocs });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/epc/orders/:id/upload-install  (Step 6 - installation photos + net metering)
const uploadInstallationDocs = async (req, res) => {
  try {
    const order = await EpcOrder.findOne({ _id: req.params.id, epcPartner: req.epc._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (req.files?.photos) {
      const photos = req.files.photos.map((f, i) => ({
        caption: req.body.captions?.[i] || '',
        fileUrl: f.path,
        uploadedAt: new Date(),
      }));
      order.installationPhotos.push(...photos);
    }
    if (req.files?.netMetering) {
      order.netMeteringDoc = req.files.netMetering[0].path;
    }
    if (order.stage === 'Installation Pending') order.stage = 'Net Metering';

    await order.save();
    res.json({ message: 'Installation docs uploaded', order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/epc/orders/:id/upload-pcr  (Step 7 - PCR report)
const uploadPcr = async (req, res) => {
  try {
    const order = await EpcOrder.findOne({ _id: req.params.id, epcPartner: req.epc._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!req.file) return res.status(400).json({ message: 'No PCR file uploaded' });

    order.pcrReport     = req.file.path;
    order.pcrUploadedAt = new Date();
    order.stage         = 'PCR Reports';

    await order.save();
    res.json({ message: 'PCR report uploaded', order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getOrderSummary,
  getMyOrders,
  getOrderById,
  updateOrderStage,
  uploadRegistrationDocs,
  uploadInstallationDocs,
  uploadPcr,
};
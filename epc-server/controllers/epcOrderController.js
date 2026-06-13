const EpcOrder = require('../models/EpcOrder');

// New stage flow — boss ke document ke hisaab se
const stageSteps = [
  'Registration Started',
  'Material Delivered',
  'Installation In Progress',
  'Installation Completed',
  'QC Verification',
  '90% Payment Released',
  'Customer Approval',
  '10% Payment Released',
  'Project Closed',
];

// GET /api/epc/orders/summary
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
const updateOrderStage = async (req, res) => {
  try {
    const order = await EpcOrder.findOne({ _id: req.params.id, epcPartner: req.epc._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const { stage } = req.body;
    if (!stageSteps.includes(stage))
      return res.status(400).json({ message: `Invalid stage. Valid stages: ${stageSteps.join(', ')}` });

    const currentIdx = stageSteps.indexOf(order.stage);
    const newIdx     = stageSteps.indexOf(stage);
    if (newIdx <= currentIdx)
      return res.status(400).json({ message: 'Cannot go back to a previous stage' });

    order.stage = stage;

    // Status auto-update
    if (stage === 'Installation In Progress') order.status = 'Ongoing';
    if (stage === 'Installation Completed')   order.installCompletedAt = new Date();
    if (stage === 'Project Closed') {
      order.status             = 'Completed';
      order.warrantyActivated  = true;
      order.warrantyActivatedAt = new Date();
    }

    await order.save();
    res.json({ message: `Order moved to: ${stage}`, order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/epc/orders/:id/upload-docs (MNRE / registration docs)
const uploadRegistrationDocs = async (req, res) => {
  try {
    const order = await EpcOrder.findOne({ _id: req.params.id, epcPartner: req.epc._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: 'No files uploaded' });

    const newDocs = req.files.map(f => ({
      docName:    f.originalname,
      fileUrl:    `/uploads/${f.filename}`,
      uploadedAt: new Date(),
    }));
    order.registrationDocs.push(...newDocs);
    order.completionChecklist.mnreDocsUploaded = true;
    await order.save();

    res.json({ message: 'Documents uploaded successfully', registrationDocs: order.registrationDocs });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/epc/orders/:id/upload-install (installation photos + net metering)
const uploadInstallationDocs = async (req, res) => {
  try {
    const order = await EpcOrder.findOne({ _id: req.params.id, epcPartner: req.epc._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (req.files?.photos) {
      const photos = req.files.photos.map((f, i) => ({
        caption:    req.body.captions?.[i] || '',
        fileUrl:    `/uploads/${f.filename}`,
        uploadedAt: new Date(),
      }));
      order.installationPhotos.push(...photos);
      order.completionChecklist.installPhotosUploaded = true;
    }

    if (req.files?.netMetering) {
      order.netMeteringDoc = `/uploads/${req.files.netMetering[0].filename}`;
      order.completionChecklist.netMeteringDone = true;
    }

    await order.save();
    res.json({ message: 'Installation docs uploaded', order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/epc/orders/:id/upload-pcr
const uploadPcr = async (req, res) => {
  try {
    const order = await EpcOrder.findOne({ _id: req.params.id, epcPartner: req.epc._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!req.file) return res.status(400).json({ message: 'No PCR file uploaded' });

    order.pcrReport     = `/uploads/${req.file.filename}`;
    order.pcrUploadedAt = new Date();
    order.completionChecklist.pcrGenerated = true;

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
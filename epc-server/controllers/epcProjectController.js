const EpcOrder = require('../models/EpcOrder');

// GET /api/epc/projects
// Document: All project types project management from this module
// Admin panel se set hota hai — EPC yahan track karta hai
const getAllProjects = async (req, res) => {
  try {
    const { stage, projectType, district, search } = req.query;

    const filter = { epcPartner: req.epc._id };

    if (stage)       filter.stage       = stage;
    if (projectType) filter.projectType = projectType;
    if (district)    filter.district    = district;

    // Search by customer name, order number, district
    if (search) {
      filter.$or = [
        { customerName:  { $regex: search, $options: 'i' } },
        { orderNumber:   { $regex: search, $options: 'i' } },
        { district:      { $regex: search, $options: 'i' } },
      ];
    }

    const projects = await EpcOrder.find(filter).sort({ createdAt: -1 });

    // Stage wise count — dashboard cards ke liye
    const stageSummary = {
      'Order Created':        0,
      'Installation Pending': 0,
      'Net Metering':         0,
      'PCR Reports':          0,
      'Completed':            0,
    };

    projects.forEach(p => {
      if (stageSummary[p.stage] !== undefined) {
        stageSummary[p.stage]++;
      }
    });

    res.json({ projects, stageSummary, total: projects.length });
  } catch (err) {
    console.error('Get projects error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/epc/projects/:id
// Single project detail — full info with docs, photos, payments
const getProjectById = async (req, res) => {
  try {
    const project = await EpcOrder.findOne({
      _id:        req.params.id,
      epcPartner: req.epc._id,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (err) {
    console.error('Get project by id error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/epc/projects/:id/stage
// Document: Order Created → Installation Pending → Net Metering → PCR Reports → Completed
const updateProjectStage = async (req, res) => {
  try {
    const stageSteps = [
      'Order Created',
      'Installation Pending',
      'Net Metering',
      'PCR Reports',
      'Completed',
    ];

    const project = await EpcOrder.findOne({
      _id:        req.params.id,
      epcPartner: req.epc._id,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const { stage } = req.body;

    if (!stageSteps.includes(stage)) {
      return res.status(400).json({ message: 'Invalid stage' });
    }

    const currentIdx = stageSteps.indexOf(project.stage);
    const newIdx     = stageSteps.indexOf(stage);

    if (newIdx <= currentIdx) {
      return res.status(400).json({ message: 'Cannot go back to a previous stage' });
    }

    project.stage = stage;

    // Status bhi update karo
    if (stage === 'Installation Pending') project.status = 'Ongoing';
    if (stage === 'Completed') {
      project.status             = 'Completed';
      project.installCompletedAt = new Date();
    }

    await project.save();
    res.json({ message: `Project moved to: ${stage}`, project });
  } catch (err) {
    console.error('Update stage error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/epc/projects/:id/upload-docs
// Step 4 — MNRE / registration documents upload
const uploadProjectDocs = async (req, res) => {
  try {
    const project = await EpcOrder.findOne({
      _id:        req.params.id,
      epcPartner: req.epc._id,
    });

    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const newDocs = req.files.map(f => ({
      docName:    f.originalname,
      fileUrl:    f.path,
      uploadedAt: new Date(),
    }));

    project.registrationDocs.push(...newDocs);
    await project.save();

    res.json({ message: 'Documents uploaded', registrationDocs: project.registrationDocs });
  } catch (err) {
    console.error('Upload docs error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/epc/projects/:id/upload-installation
// Step 6 — Installation photos + net metering document
const uploadInstallationPhotos = async (req, res) => {
  try {
    const project = await EpcOrder.findOne({
      _id:        req.params.id,
      epcPartner: req.epc._id,
    });

    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (req.files?.photos) {
      const photos = req.files.photos.map((f, i) => ({
        caption:    req.body.captions?.[i] || '',
        fileUrl:    f.path,
        uploadedAt: new Date(),
      }));
      project.installationPhotos.push(...photos);
    }

    if (req.files?.netMetering) {
      project.netMeteringDoc = req.files.netMetering[0].path;
    }

    if (project.stage === 'Installation Pending') {
      project.stage = 'Net Metering';
    }

    await project.save();
    res.json({ message: 'Installation docs uploaded', project });
  } catch (err) {
    console.error('Upload installation error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/epc/projects/:id/upload-pcr
// Step 7 — PCR (Project Completion Report) upload
const uploadPcrReport = async (req, res) => {
  try {
    const project = await EpcOrder.findOne({
      _id:        req.params.id,
      epcPartner: req.epc._id,
    });

    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!req.file) return res.status(400).json({ message: 'No PCR file uploaded' });

    project.pcrReport     = req.file.path;
    project.pcrUploadedAt = new Date();
    project.stage         = 'PCR Reports';

    await project.save();
    res.json({ message: 'PCR report uploaded', project });
  } catch (err) {
    console.error('Upload PCR error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  updateProjectStage,
  uploadProjectDocs,
  uploadInstallationPhotos,
  uploadPcrReport,
};
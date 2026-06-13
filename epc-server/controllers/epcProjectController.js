const EpcOrder = require('../models/EpcOrder');

// ── GET ALL PROJECTS ─────────────────────────────────────────────────────────
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

    // FIX: Schema stages ke sath strictly map kiya dashboard cards ke liye
    const stageSummary = {
      'Registration Started':    0,
      'Material Delivered':      0,
      'Installation In Progress':0,
      'Installation Completed':  0,
      'QC Verification':         0,
      '90% Payment Released':    0,
      'Customer Approval':       0,
      '10% Payment Released':    0,
      'Project Closed':          0,
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

// ── GET PROJECT BY ID ────────────────────────────────────────────────────────
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

// ── UPDATE PROJECT STAGE ─────────────────────────────────────────────────────
const updateProjectStage = async (req, res) => {
  try {
    // Boss ke document ke mutabik strictly correct schema stages flow
    const stageSteps = [
      'Registration Started',
      'Material Delivered',
      'Installation In Progress',
      'Installation Completed',
      'QC Verification',
      '90% Payment Released',
      'Customer Approval',
      '10% Payment Released',
      'Project Closed'
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

    // FIX: Schema values ke hisab se status auto-update
    if (stage === 'Material Delivered' || stage === 'Installation In Progress') {
      project.status = 'Ongoing';
    }
    
    if (stage === 'Project Closed') {
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

// ── POST: UPLOAD PROJECT DOCS ────────────────────────────────────────────────
// Step 4 — MNRE / registration documents upload (Registration Started stage)
const uploadProjectDocs = async (req, res) => {
  try {
    const project = await EpcOrder.findOne({
      _id:        req.params.id,
      epcPartner: req.epc._id,
    });

    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Multer validation
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // FIX: Windows/Linux paths ko safe URLs me badla aur checklist trigger kiya
    const newDocs = req.files.map(f => ({
      docName:    f.originalname,
      fileUrl:    `/${f.path.replace(/\\/g, '/')}`, 
      uploadedAt: new Date(),
    }));

    project.registrationDocs.push(...newDocs);
    project.completionChecklist.mnreDocsUploaded = true; // Schema checklist sync
    
    await project.save();

    res.json({ message: 'Documents uploaded', registrationDocs: project.registrationDocs });
  } catch (err) {
    console.error('Upload docs error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── POST: UPLOAD INSTALLATION PHOTOS ─────────────────────────────────────────
// Step 6 — Installation photos + net metering document (Installation Completed stage)
const uploadInstallationPhotos = async (req, res) => {
  try {
    const project = await EpcOrder.findOne({
      _id:        req.params.id,
      epcPartner: req.epc._id,
    });

    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Multer multi-field checking aur normalisation
    if (req.files?.photos) {
      const photos = req.files.photos.map((f, i) => ({
        caption:    req.body.captions ? (Array.isArray(req.body.captions) ? req.body.captions[i] : req.body.captions) : '',
        fileUrl:    `/${f.path.replace(/\\/g, '/')}`,
        uploadedAt: new Date(),
      }));
      project.installationPhotos.push(...photos);
      project.completionChecklist.installPhotosUploaded = true;
      project.completionChecklist.gpsPhotosUploaded     = true; 
    }

    if (req.files?.netMetering) {
      project.netMeteringDoc = `/${req.files.netMetering[0].path.replace(/\\/g, '/')}`;
      project.completionChecklist.netMeteringDone = true;
    }

    // FIX: Schema stage ke mutabik flow upgrade kiya
    if (project.stage === 'Installation In Progress') {
      project.stage = 'Installation Completed';
    }

    await project.save();
    res.json({ message: 'Installation docs uploaded successfully', project });
  } catch (err) {
    console.error('Upload installation error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── POST: UPLOAD PCR REPORT ──────────────────────────────────────────────────
// Step 7 — PCR (Project Completion Report) upload (QC Verification stage)
const uploadPcrReport = async (req, res) => {
  try {
    const project = await EpcOrder.findOne({
      _id:        req.params.id,
      epcPartner: req.epc._id,
    });

    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    // Single file multer validation
    if (!req.file) return res.status(400).json({ message: 'No PCR file uploaded' });

    // FIX: Normalised path, stage strictly updated to 'QC Verification' as per schema
    project.pcrReport     = `/${req.file.path.replace(/\\/g, '/')}`;
    project.pcrUploadedAt = new Date();
    project.stage         = 'QC Verification'; 
    project.completionChecklist.pcrGenerated = true;

    await project.save();
    res.json({ message: 'PCR report uploaded successfully', project });
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
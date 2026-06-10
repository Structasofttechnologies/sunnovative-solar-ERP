const mongoose = require('mongoose');

const epcOrderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  epcPartner:  { type: mongoose.Schema.Types.ObjectId, ref: 'EpcPartner', required: true },
  enquiry:     { type: mongoose.Schema.Types.ObjectId, ref: 'EpcEnquiry' },

  customerName:   { type: String, required: true },
  customerMobile: { type: String, required: true },
  customerEmail:  { type: String },

  projectType: {
    type: String,
    enum: [
      'Surya Ghar Yojana',
      'Group Solar',
      'Village Solar Campaign',
      'Commercial Solar',
      'Residential Solar',
    ],
    required: true,
  },

  systemCapacityKw: { type: Number },
  state:    { type: String },
  district: { type: String },
  city:     { type: String },
  address:  { type: String },

  totalProjectValue: { type: Number, default: 0 },

  // ── Payment ─────────────────────────────────────────────────────────
  payment90: {
    amount:     { type: Number, default: 0 },
    status:     { type: String, enum: ['Pending', 'Released'], default: 'Pending' },
    releasedAt: { type: Date },
    receipt:    { type: String },
  },
  payment10: {
    amount:     { type: Number, default: 0 },
    status:     { type: String, enum: ['Pending', 'Released'], default: 'Pending' },
    releasedAt: { type: Date },
  },

  // ── Full Stage Flow (boss ka document — Recommended Status Flow) ────
  stage: {
    type: String,
    enum: [
      'Registration Started',    // EPC uploads MNRE/DISCOM docs, site survey
      'Material Delivered',      // Material delivery
      'Installation In Progress',// Installation chal raha hai
      'Installation Completed',  // Installation complete
      'QC Verification',         // Admin/QC review — PCR report generated
      '90% Payment Released',    // 90% EPC ko mila
      'Customer Approval',       // Customer rating de raha hai
      '10% Payment Released',    // 10% escrow release
      'Project Closed',          // Project band — warranty activate
    ],
    default: 'Registration Started',
  },

  // ── Admin set status (New, Ongoing, Overdue) ─────────────────────────
  status: {
    type: String,
    enum: ['New', 'Ongoing', 'Overdue', 'Completed', 'Cancelled'],
    default: 'New',
  },

  scheduledInstallDate:  { type: Date },
  installCompletedAt:    { type: Date },
  dueDateForCompletion:  { type: Date },
  isOverdue:             { type: Boolean, default: false },

  // ── Customer Rating (step: Customer Approval) ────────────────────────
  customerRating:   { type: Number, min: 1, max: 5 },
  customerFeedback: { type: String },
  ratedAt:          { type: Date },

  // ── Documents ────────────────────────────────────────────────────────
  // MNRE / DISCOM docs (Registration Started stage)
  registrationDocs: [{
    docName:    { type: String },
    fileUrl:    { type: String },
    uploadedAt: { type: Date, default: Date.now },
  }],

  // Installation photos + GPS photos (Installation Completed stage)
  installationPhotos: [{
    caption:    { type: String },
    fileUrl:    { type: String },
    uploadedAt: { type: Date, default: Date.now },
  }],

  // Net metering document
  netMeteringDoc: { type: String },

  // PCR Report (QC Verification stage)
  pcrReport:     { type: String },
  pcrUploadedAt: { type: Date },

  // Completion checklist
  completionChecklist: {
    installPhotosUploaded:  { type: Boolean, default: false },
    gpsPhotosUploaded:      { type: Boolean, default: false },
    netMeteringDone:        { type: Boolean, default: false },
    mnreDocsUploaded:       { type: Boolean, default: false },
    pcrGenerated:           { type: Boolean, default: false },
  },

  // Warranty
  warrantyActivated:   { type: Boolean, default: false },
  warrantyActivatedAt: { type: Date },

}, { timestamps: true });

// Auto-generate order number
epcOrderSchema.pre('validate', async function () {
  if (!this.orderNumber) {
    const count = await mongoose.model('EpcOrder').countDocuments();
    this.orderNumber = `SUN-ORD-${String(count + 1).padStart(6, '0')}`;
  }

});

module.exports = mongoose.model('EpcOrder', epcOrderSchema);
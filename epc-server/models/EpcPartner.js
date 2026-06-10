const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const epcPartnerSchema = new mongoose.Schema({
  companyName:        { type: String, required: true, trim: true },
  ownerName:          { type: String, required: true, trim: true },
  email:              { type: String, required: true, unique: true, lowercase: true, trim: true },
  mobile:             { type: String, required: true, unique: true, trim: true },
  password:           { type: String, required: true },
  state:              { type: String },
  district:           { type: String },
  city:               { type: String },
  pincode:            { type: String },
  address:            { type: String },
  yearsOfExperience:  { type: Number, default: 0 },
  hqLocation:         { type: String },
  qualifiedProjectTypes: [{ type: String }],
  plan: {
    type: String,
    enum: ['Standard', 'Professional', 'Enterprise'],
    default: 'Standard',
  },
  planExpiresAt:      { type: Date },
  activeDistricts:    [{ type: String }],
  onboardingStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Verified', 'Rejected', 'Suspended'],
    default: 'Pending',
  },
  kycDocuments: {
    panCard:         { type: String },
    gstNumber:       { type: String },
    companyLetter:   { type: String },
    agreementSigned: { type: Boolean, default: false },
    agreementDate:   { type: Date },
    agreementType:   { type: String, enum: ['OTP', 'Physical', ''] },
  },
  rating:       { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  isActive:     { type: Boolean, default: true },
  approvedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

epcPartnerSchema.pre('save', async function () {
  if (!this.isModified('password')) return ;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

});

epcPartnerSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('EpcPartner', epcPartnerSchema);
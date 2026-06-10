const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const epcTeamMemberSchema = new mongoose.Schema({
  epcPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'EpcPartner', required: true },
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, lowercase: true, trim: true },
  mobile:   { type: String, required: true, trim: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['Manager', 'Installer', 'SalesAgent', 'Support'],
    default: 'Installer',
  },
  assignedDistricts:    [{ type: String }],
  assignedProjectTypes: [{ type: String }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

epcTeamMemberSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

epcTeamMemberSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('EpcTeamMember', epcTeamMemberSchema);
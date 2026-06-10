const mongoose = require('mongoose');

const epcEnquirySchema = new mongoose.Schema({
  epcPartner:     { type: mongoose.Schema.Types.ObjectId, ref: 'EpcPartner' },
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
  district: { type: String, required: true },
  city:     { type: String },
  address:  { type: String },

  // Token payment — customer pays token to lock enquiry
  tokenAmount: { type: Number, default: 0 },
  tokenPaid:   { type: Boolean, default: false },
  tokenPaidAt: { type: Date },
  orderNumber: { type: String },

  // ── Updated Status Flow (boss ka document) ──────────────────────────
  // Lead → Token Paid → Order Generated → Open For EPC →
  // Bid Running → EPC Accepted → Customer Selected EPC →
  // Converted (order ban gaya)
  status: {
    type: String,
    enum: [
      'Lead',               // Initial enquiry / lead
      'Token Paid',         // Customer ne token diya
      'Order Generated',    // Order number generate hua
      'Open For EPC',       // EPC dekh sakte hain
      'Bid Running',        // EPCs bid/apply kar rahe hain (>10kW)
      'EPC Accepted',       // EPC ne accept kiya
      'Customer Selected EPC', // Customer ne EPC choose kiya
      'Converted',          // Order ban gaya
      'Expired',            // 24hr window expire
      'Rejected',           // Reject hua
    ],
    default: 'Lead',
  },

  // Order assignment type — admin settings se aata hai
  // First Come First Serve (<10kW) ya Bid System (>10kW)
  assignmentType: {
    type: String,
    enum: ['FirstComeFirstServe', 'BidSystem'],
    default: 'FirstComeFirstServe',
  },

  acceptedAt:    { type: Date },
  acceptanceFee: { type: Number, default: 0 },

  // Customer 24hrs mein EPC select karta hai
  customerSelectionDeadline: { type: Date },
  customerSelectedAt:        { type: Date },

  convertedToOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'EpcOrder' },
  convertedAt:      { type: Date },

  leadRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
}, { timestamps: true });

module.exports = mongoose.model('EpcEnquiry', epcEnquirySchema);
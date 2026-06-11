const mongoose = require('mongoose');

const epcEnquirySchema = new mongoose.Schema({
  epcPartner:     { type: mongoose.Schema.Types.ObjectId, ref: 'EpcPartner' },
  customerName:   { type: String, required: true },
  customerMobile: { type: String, required: true },
  customerEmail:  { type: String },

  // ── Enquiry Type — boss ne 3 types bataye ───────────────────────────
  enquiryType: {
    type: String,
    enum: [
      'ECommerce',   // Customer ne website se direct order diya (token paid)
      'Bidding',     // >10kW — EPC bid karta hai (Bid System)
      'QuoteByEPC',  // EPC apna quote deta hai customer ko
    ],
    default: 'ECommerce',
  },

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

  tokenAmount: { type: Number, default: 0 },
  tokenPaid:   { type: Boolean, default: false },
  tokenPaidAt: { type: Date },
  orderNumber: { type: String },

  status: {
    type: String,
    enum: [
      'Lead',
      'Token Paid',
      'Order Generated',
      'Open For EPC',
      'Bid Running',
      'EPC Accepted',
      'Customer Selected EPC',
      'Converted',
      'Expired',
      'Rejected',
    ],
    default: 'Lead',
  },

  assignmentType: {
    type: String,
    enum: ['FirstComeFirstServe', 'BidSystem'],
    default: 'FirstComeFirstServe',
  },

  acceptedAt:    { type: Date },
  acceptanceFee: { type: Number, default: 0 },
  customerSelectionDeadline: { type: Date },
  customerSelectedAt:        { type: Date },
  convertedToOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'EpcOrder' },
  convertedAt:      { type: Date },
  leadRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
}, { timestamps: true });

module.exports = mongoose.model('EpcEnquiry', epcEnquirySchema);
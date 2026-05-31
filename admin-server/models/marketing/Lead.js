import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
    },
    whatsapp: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    // Location fields
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
      default: null,
    },
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'State',
      default: null,
    },
    district: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
      default: null,
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      default: null,
    },
    cluster: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cluster',
      default: null,
    },
    zone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      default: null,
    },
    pincode: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },

    // Project / Solar info
    // solarType: project ka slug (surya-ghar, group-solar, rwa-society, commercial, village, msme, general)
    solarType: {
      type: String,
      required: [true, 'Solar type / Project is required'],
      default: 'general',
    },
    subType: {
      type: String,
    },
    kw: {
      type: String,
      default: '0',
    },
    billAmount: {
      type: Number,
      default: 0,
    },
    rural: {
      type: String,
    },
    sourceOfMedia: {
      type: String,
    },
    profession: {
      type: String,
    },
    notes: {
      type: String,
      trim: true,
    },

    // Status
   status: {
  type: String,
  enum: ['New', 'Called', 'Interested', 'Not Interested', 'Follow Up', 'Converted', 'Junk'],
  default: 'New',
},

    // Ownership & assignment
    dealer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // History log
    history: [
      {
        action: String,
        date: { type: Date, default: Date.now },
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],

    // Quote info
    quote: {
      totalAmount: Number,
      commission: Number,
      netAmount: Number,
      systemSize: String,
      generatedAt: Date,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for faster queries
leadSchema.index({ dealer: 1, isActive: 1 });
leadSchema.index({ solarType: 1, isActive: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ createdAt: -1 });

export default mongoose.model('Lead', leadSchema);
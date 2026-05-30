import mongoose from 'mongoose';

/**
 * FormSubmission – stores each submitted form entry dynamically.
 * The `data` field is a flexible Map so any field from any form can be stored.
 */
const formSubmissionSchema = new mongoose.Schema(
  {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FormSchema',
      required: true,
    },
    projectSlug: {
      type: String,
      required: true,
      trim: true,
    },
    // Dynamic data submitted by the user
    data: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Track which user submitted (if authenticated)
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // File paths for uploaded files keyed by fieldName
    files: {
      type: Map,
      of: String,
      default: {},
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'approved', 'rejected'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

formSubmissionSchema.index({ formId: 1 });
formSubmissionSchema.index({ projectSlug: 1 });
formSubmissionSchema.index({ status: 1 });
formSubmissionSchema.index({ submittedBy: 1 });

export default mongoose.model('FormSubmission', formSubmissionSchema);
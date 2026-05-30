import mongoose from 'mongoose';

/**
 * FormField Schema – defines a single input field inside a form
 */
const formFieldSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    fieldName: {
      // snake_case key used when storing submitted data, e.g. "full_name"
      type: String,
      required: true,
      trim: true,
    },
    fieldType: {
      type: String,
      required: true,
      enum: [
        'text',
        'number',
        'email',
        'mobile',
        'textarea',
        'dropdown',
        'radio',
        'checkbox',
        'file',
        'date',
      ],
      default: 'text',
    },
    placeholder: {
      type: String,
      trim: true,
      default: '',
    },
    isRequired: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
    // For dropdown / radio / checkbox – stores array of option strings
    options: {
      type: [String],
      default: [],
    },
    // Accepted file extensions for "file" type, e.g. [".pdf", ".jpg"]
    acceptedFormats: {
      type: [String],
      default: [],
    },
    // Validation hints
    minLength: { type: Number, default: null },
    maxLength: { type: Number, default: null },
    minValue:  { type: Number, default: null },
    maxValue:  { type: Number, default: null },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

/**
 * FormSchema – defines a project-level form containing multiple fields
 */
const formSchema = new mongoose.Schema(
  {
    projectSlug: {
      // URL-friendly identifier, e.g. "surya-ghar-yojana"
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    projectName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    fields: [formFieldSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

formSchema.index({ projectSlug: 1 });
formSchema.index({ isActive: 1 });

export default mongoose.model('FormSchema', formSchema);
import mongoose from 'mongoose';

const projectDescriptionSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    projectTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProjectType',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('ProjectDescription', projectDescriptionSchema);
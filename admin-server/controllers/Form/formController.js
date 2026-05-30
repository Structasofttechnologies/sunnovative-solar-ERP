import FormSchema from '../../models/Form/FormSchema.js';
import FormSubmission from '../../models/Form/FormSubmission.js';

// ─────────────────────────────────────────────
// Helper: slugify a project name
// ─────────────────────────────────────────────
const toSlug = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

// ─────────────────────────────────────────────
// ADMIN: Get all forms (with field count)
// ─────────────────────────────────────────────
export const getAllForms = async (req, res) => {
  try {
    const forms = await FormSchema.find()
      .select('projectSlug projectName description isActive fields createdAt updatedAt')
      .sort({ createdAt: -1 });

    const result = forms.map((f) => ({
      _id: f._id,
      projectSlug: f.projectSlug,
      projectName: f.projectName,
      description: f.description,
      isActive: f.isActive,
      fieldCount: f.fields.length,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
    }));

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// ADMIN: Get single form with all fields
// ─────────────────────────────────────────────
export const getFormById = async (req, res) => {
  try {
    const form = await FormSchema.findById(req.params.id);
    if (!form) return res.status(404).json({ success: false, message: 'Form not found' });
    res.status(200).json({ success: true, data: form });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// PUBLIC: Get form by projectSlug (for frontend rendering)
// Response shape matches spec: { projectName, fields[] }
// ─────────────────────────────────────────────
export const getFormBySlug = async (req, res) => {
  try {
    const form = await FormSchema.findOne({
      projectSlug: req.params.slug,
      isActive: true,
    });

    if (!form) return res.status(404).json({ success: false, message: 'Form not found' });

    // Return only active fields, sorted by order
    const fields = form.fields
      .filter((f) => f.isActive)
      .sort((a, b) => a.order - b.order)
      .map((f) => ({
        _id: f._id,
        label: f.label,
        fieldName: f.fieldName,
        type: f.fieldType,
        placeholder: f.placeholder,
        required: f.isRequired,
        options: f.options,
        acceptedFormats: f.acceptedFormats,
        minLength: f.minLength,
        maxLength: f.maxLength,
        minValue: f.minValue,
        maxValue: f.maxValue,
      }));

    res.status(200).json({
      success: true,
      data: {
        _id: form._id,
        projectName: form.projectName,
        projectSlug: form.projectSlug,
        description: form.description,
        fields,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// ADMIN: Create new form
// ─────────────────────────────────────────────
export const createForm = async (req, res) => {
  try {
    const { projectName, description, isActive, fields } = req.body;

    if (!projectName) {
      return res.status(400).json({ success: false, message: 'projectName is required' });
    }

    const projectSlug = toSlug(projectName);

    const exists = await FormSchema.findOne({ projectSlug });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: `A form already exists for project slug "${projectSlug}"`,
      });
    }

    // Assign order automatically if not provided
    const normalizedFields = (fields || []).map((f, idx) => ({
      ...f,
      fieldName: f.fieldName || toSlug(f.label),
      order: f.order !== undefined ? f.order : idx,
    }));

    const form = new FormSchema({
      projectSlug,
      projectName,
      description,
      isActive: isActive !== undefined ? isActive : true,
      fields: normalizedFields,
      createdBy: req.user?._id || req.user?.id || null,
    });

    await form.save();
    res.status(201).json({ success: true, data: form, message: 'Form created successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// ADMIN: Update form meta (name, description, isActive)
// ─────────────────────────────────────────────
export const updateForm = async (req, res) => {
  try {
    const { projectName, description, isActive } = req.body;

    const form = await FormSchema.findById(req.params.id);
    if (!form) return res.status(404).json({ success: false, message: 'Form not found' });

    if (projectName) form.projectName = projectName;
    if (description !== undefined) form.description = description;
    if (isActive !== undefined) form.isActive = isActive;
    form.updatedBy = req.user?._id || req.user?.id || null;

    await form.save();
    res.status(200).json({ success: true, data: form, message: 'Form updated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// ADMIN: Delete form
// ─────────────────────────────────────────────
export const deleteForm = async (req, res) => {
  try {
    const form = await FormSchema.findByIdAndDelete(req.params.id);
    if (!form) return res.status(404).json({ success: false, message: 'Form not found' });
    res.status(200).json({ success: true, message: 'Form deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// ADMIN: Replace all fields for a form (bulk save)
// ─────────────────────────────────────────────
export const updateFormFields = async (req, res) => {
  try {
    const { fields } = req.body;
    if (!Array.isArray(fields)) {
      return res.status(400).json({ success: false, message: 'fields must be an array' });
    }

    const form = await FormSchema.findById(req.params.id);
    if (!form) return res.status(404).json({ success: false, message: 'Form not found' });

    // Normalize
    const normalizedFields = fields.map((f, idx) => ({
      ...f,
      fieldName: f.fieldName || toSlug(f.label),
      order: f.order !== undefined ? f.order : idx,
    }));

    form.fields = normalizedFields;
    form.updatedBy = req.user?._id || req.user?.id || null;
    await form.save();

    res.status(200).json({ success: true, data: form, message: 'Fields updated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// ADMIN: Add a single field to a form
// ─────────────────────────────────────────────
export const addField = async (req, res) => {
  try {
    const form = await FormSchema.findById(req.params.id);
    if (!form) return res.status(404).json({ success: false, message: 'Form not found' });

    const fieldData = {
      ...req.body,
      fieldName: req.body.fieldName || toSlug(req.body.label),
      order: req.body.order !== undefined ? req.body.order : form.fields.length,
    };

    form.fields.push(fieldData);
    form.updatedBy = req.user?._id || req.user?.id || null;
    await form.save();

    const addedField = form.fields[form.fields.length - 1];
    res.status(201).json({ success: true, data: addedField, message: 'Field added successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// ADMIN: Update a single field
// ─────────────────────────────────────────────
export const updateField = async (req, res) => {
  try {
    const { id, fieldId } = req.params;

    const form = await FormSchema.findById(id);
    if (!form) return res.status(404).json({ success: false, message: 'Form not found' });

    const field = form.fields.id(fieldId);
    if (!field) return res.status(404).json({ success: false, message: 'Field not found' });

    Object.assign(field, req.body);
    if (req.body.label && !req.body.fieldName) {
      field.fieldName = toSlug(req.body.label);
    }
    form.updatedBy = req.user?._id || req.user?.id || null;

    await form.save();
    res.status(200).json({ success: true, data: field, message: 'Field updated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// ADMIN: Remove a single field
// ─────────────────────────────────────────────
export const removeField = async (req, res) => {
  try {
    const { id, fieldId } = req.params;

    const form = await FormSchema.findById(id);
    if (!form) return res.status(404).json({ success: false, message: 'Form not found' });

    const field = form.fields.id(fieldId);
    if (!field) return res.status(404).json({ success: false, message: 'Field not found' });

    field.deleteOne();
    form.updatedBy = req.user?._id || req.user?.id || null;

    await form.save();
    res.status(200).json({ success: true, message: 'Field removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// PUBLIC: Submit form data
// ─────────────────────────────────────────────
export const submitForm = async (req, res) => {
  try {
    const form = await FormSchema.findOne({
      projectSlug: req.params.slug,
      isActive: true,
    });

    if (!form) return res.status(404).json({ success: false, message: 'Form not found' });

    // Validate required fields
    const activeFields = form.fields.filter((f) => f.isActive);
    const errors = [];

    for (const field of activeFields) {
      if (field.isRequired) {
        const val = req.body[field.fieldName];
        if (val === undefined || val === null || val === '') {
          errors.push(`${field.label} is required`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // Build data map from only defined form fields
    const dataMap = {};
    for (const field of activeFields) {
      if (req.body[field.fieldName] !== undefined) {
        dataMap[field.fieldName] = req.body[field.fieldName];
      }
    }

    // Handle uploaded files (if multer is used upstream)
    const filesMap = {};
    if (req.files) {
      for (const [key, fileArr] of Object.entries(req.files)) {
        filesMap[key] = fileArr[0]?.path || fileArr[0]?.filename || '';
      }
    }

    const submission = new FormSubmission({
      formId: form._id,
      projectSlug: form.projectSlug,
      data: dataMap,
      files: filesMap,
      submittedBy: req.user?._id || req.user?.id || null,
    });

    await submission.save();
    res.status(201).json({
      success: true,
      data: submission,
      message: 'Form submitted successfully',
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// ADMIN: Get all submissions for a form
// ─────────────────────────────────────────────
export const getFormSubmissions = async (req, res) => {
  try {
    const { slug } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    const filter = { projectSlug: slug };
    if (status) filter.status = status;

    const total = await FormSubmission.countDocuments(filter);
    const submissions = await FormSubmission.find(filter)
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: submissions,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// ADMIN: Update submission status
// ─────────────────────────────────────────────
export const updateSubmissionStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const submission = await FormSubmission.findByIdAndUpdate(
      req.params.submissionId,
      { status, notes },
      { new: true }
    );
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });
    res.status(200).json({ success: true, data: submission, message: 'Status updated' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
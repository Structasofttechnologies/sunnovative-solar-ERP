import express from 'express';
import {
  getAllForms,
  getFormById,
  getFormBySlug,
  createForm,
  updateForm,
  deleteForm,
  updateFormFields,
  addField,
  updateField,
  removeField,
  submitForm,
  getFormSubmissions,
  updateSubmissionStatus,
} from '../../controllers/Form/formController.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

// ─────────────────────────────────────
// PUBLIC routes (no auth needed)
// ─────────────────────────────────────

// GET /api/forms/public/:slug  → fetch form schema for rendering on frontend
router.get('/public/:slug', getFormBySlug);

// POST /api/forms/public/:slug/submit → submit form data
router.post('/public/:slug/submit', submitForm);

// ─────────────────────────────────────
// ADMIN routes (auth required)
// ─────────────────────────────────────

// GET  /api/forms                → list all forms
router.get('/', protect, getAllForms);

// POST /api/forms                → create a new form
router.post('/', protect, createForm);

// GET  /api/forms/:id            → get form with fields
router.get('/:id', protect, getFormById);

// PUT  /api/forms/:id            → update form meta
router.put('/:id', protect, updateForm);

// DELETE /api/forms/:id          → delete form
router.delete('/:id', protect, deleteForm);

// ─────────────────────────────────────
// Field management endpoints
// ─────────────────────────────────────

// PUT  /api/forms/:id/fields     → bulk replace all fields
router.put('/:id/fields', protect, updateFormFields);

// POST /api/forms/:id/fields     → add a single field
router.post('/:id/fields', protect, addField);

// PUT  /api/forms/:id/fields/:fieldId  → update a single field
router.put('/:id/fields/:fieldId', protect, updateField);

// DELETE /api/forms/:id/fields/:fieldId → remove a single field
router.delete('/:id/fields/:fieldId', protect, removeField);

// ─────────────────────────────────────
// Submissions
// ─────────────────────────────────────

// GET /api/forms/submissions/:slug       → get submissions for a form
router.get('/submissions/:slug', protect, getFormSubmissions);

// PUT /api/forms/submissions/:submissionId/status → update submission status
router.put('/submissions/:submissionId/status', protect, updateSubmissionStatus);

export default router;
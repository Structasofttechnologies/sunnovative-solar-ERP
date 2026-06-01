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
import { protect } from '../../middleware/auth.js';

const router = express.Router();

// ─────────────────────────────────────────────────
// IMPORTANT: Specific/static routes PEHLE define karein
// Express upar se neeche match karta hai, isliye
// /public/:slug aur /submissions/:slug ko /:id se PEHLE
// rakhna zaroori hai, warna Express inhe /:id samajhega
// ─────────────────────────────────────────────────

// ─────────────────────────────────────
// PUBLIC routes (no auth needed)
// ─────────────────────────────────────

// GET  /api/forms/public/:slug  → form schema fetch karo frontend ke liye
router.get('/public/:slug', getFormBySlug);

// POST /api/forms/public/:slug/submit → form submit karo
router.post('/public/:slug/submit', submitForm);

// ─────────────────────────────────────
// Submissions routes — /:id se PEHLE (warna conflict)
// ─────────────────────────────────────

// GET /api/forms/submissions/:slug → form ki saari submissions
router.get('/submissions/:slug', protect, getFormSubmissions);

// PUT /api/forms/submissions/:submissionId/status → submission status update
router.put('/submissions/:submissionId/status', protect, updateSubmissionStatus);

// ─────────────────────────────────────
// ADMIN: Form CRUD
// ─────────────────────────────────────

// GET  /api/forms       → sabhi forms ki list
router.get('/', protect, getAllForms);

// POST /api/forms       → naya form banao
router.post('/', protect, createForm);

// GET  /api/forms/:id   → form with all fields
router.get('/:id', protect, getFormById);

// PUT  /api/forms/:id   → form meta update (name, description, isActive)
router.put('/:id', protect, updateForm);

// DELETE /api/forms/:id → form delete karo
router.delete('/:id', protect, deleteForm);

// ─────────────────────────────────────
// Field management
// ─────────────────────────────────────

// PUT  /api/forms/:id/fields                → bulk sabhi fields replace karo
router.put('/:id/fields', protect, updateFormFields);

// POST /api/forms/:id/fields                → ek field add karo
router.post('/:id/fields', protect, addField);

// PUT  /api/forms/:id/fields/:fieldId       → ek field update karo
router.put('/:id/fields/:fieldId', protect, updateField);

// DELETE /api/forms/:id/fields/:fieldId     → ek field remove karo
router.delete('/:id/fields/:fieldId', protect, removeField);

export default router;
import multer from 'multer';
import * as XLSX from 'xlsx';
import Lead from '../../models/marketing/Lead.js';

// Multer memory storage
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ─── CREATE LEAD ──────────────────────────────────────────────────────────────
export const createLead = async (req, res, next) => {
  try {
    const {
      name, mobile, phone, whatsapp, email,
      district, city, state, country, cluster, zone,
      pincode, address, solarType, project, subType,
      kw, systemCapacity, billAmount, rural,
      sourceOfMedia, profession, notes,
    } = req.body;

    const resolvedMobile = mobile || phone || '';
    const resolvedSolarType = solarType || project || 'general';
    const resolvedKw = kw || systemCapacity || '0';

    if (!name || !name.trim())
      return res.status(400).json({ success: false, message: 'Name is required' });
    if (!resolvedMobile || !resolvedMobile.trim())
      return res.status(400).json({ success: false, message: 'Mobile/Phone is required' });

    const lead = await Lead.create({
      name: name.trim(),
      mobile: resolvedMobile.trim(),
      whatsapp: whatsapp || resolvedMobile.trim(),
      email,
      district: district || null,
      city: city || null,
      state: state || null,
      country: country || null,
      cluster: cluster || null,
      zone: zone || null,
      pincode, address,
      solarType: resolvedSolarType,
      subType,
      kw: resolvedKw,
      billAmount: billAmount || 0,
      rural, sourceOfMedia, profession, notes,
      dealer: req.user.id,
      history: [{ action: 'Created', by: req.user.id }],
    });

    res.status(201).json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
};

// ─── GET ALL LEADS ────────────────────────────────────────────────────────────
export const getAllLeads = async (req, res, next) => {
  try {
    const { status, search, district, project, assignedTo, startDate, endDate, page = 1, limit = 50 } = req.query;
    const query = { isActive: true };

    if (req.user.role !== 'admin') query.dealer = req.user.id;
    if (status && status !== 'All') query.status = status;
    if (district && district !== 'All') query.district = district;
    if (project && project !== 'All') query.solarType = project;
    if (assignedTo) query.assignedTo = assignedTo;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .populate('district', 'name')
      .populate('city', 'name')
      .populate('dealer', 'name mobile phone')
      .populate('assignedTo', 'name phone email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, count: leads.length, total, page: Number(page), data: leads });
  } catch (err) {
    next(err);
  }
};

// ─── GET LEAD BY ID ───────────────────────────────────────────────────────────
export const getLeadById = async (req, res, next) => {
  try {
    const query = { _id: req.params.id, isActive: true };
    if (req.user.role !== 'admin') query.dealer = req.user.id;

    const lead = await Lead.findOne(query)
      .populate('district', 'name')
      .populate('city', 'name')
      .populate('dealer', 'name mobile phone')
      .populate('assignedTo', 'name phone email role');

    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
};

// ─── UPDATE LEAD ──────────────────────────────────────────────────────────────
export const updateLead = async (req, res, next) => {
  try {
    const { status, ...updateData } = req.body;
    const query = { _id: req.params.id, isActive: true };
    if (req.user.role !== 'admin') query.dealer = req.user.id;

    let lead = await Lead.findOne(query);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    Object.assign(lead, updateData);
    if (status && status !== lead.status) {
      lead.status = status;
      lead.history.push({ action: `Status updated to ${status}`, by: req.user.id });
    }

    await lead.save();
    res.json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE LEAD ──────────────────────────────────────────────────────────────
export const deleteLead = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== 'admin') query.dealer = req.user.id;

    const lead = await Lead.findOneAndUpdate(query, { isActive: false }, { new: true });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// ─── GET LEADS BY PROJECT ─────────────────────────────────────────────────────
export const getLeadsByProject = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { status, search, page = 1, limit = 50 } = req.query;
    const query = { solarType: slug, isActive: true };
    if (req.user.role !== 'admin') query.dealer = req.user.id;
    if (status && status !== 'All') query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .populate('district', 'name')
      .populate('city', 'name')
      .populate('dealer', 'name mobile phone')
      .populate('assignedTo', 'name phone email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, count: leads.length, total, page: Number(page), data: leads });
  } catch (err) {
    next(err);
  }
};

// ─── ASSIGN LEAD ──────────────────────────────────────────────────────────────
export const assignLead = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;
    const query = { _id: req.params.id, isActive: true };
    if (req.user.role !== 'admin') query.dealer = req.user.id;

    const lead = await Lead.findOne(query);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    lead.assignedTo = assignedTo;
    lead.history.push({ action: `Assigned to ${assignedTo}`, by: req.user.id });
    await lead.save();

    res.json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
};

// ─── BULK UPLOAD (CSV/XLSX) ───────────────────────────────────────────────────
export const uploadLeads = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File required hai' });
    }

    const project = req.body.project || 'general';
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!rows.length) {
      return res.status(400).json({ success: false, message: 'No data found in the file' });
    }

    const leads = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const mobile = String(row.phone || row.mobile || '').trim();
      const name = String(row.name || '').trim();

      if (!mobile) {
        errors.push(`Row ${i + 2}: phone/mobile missing`);
        continue;
      }

      leads.push({
        name: name || 'Unknown',
        mobile,
        whatsapp: mobile,
        email: row.email || undefined,
        pincode: row.pincode ? String(row.pincode) : undefined,
        address: row.address || undefined,
        solarType: project,
        kw: row.systemCapacity ? String(row.systemCapacity) : '0',
        billAmount: row.billAmount ? Number(row.billAmount) : 0,
        notes: row.notes || undefined,
        dealer: req.user.id,
        history: [{ action: 'Bulk uploaded', by: req.user.id }],
      });
    }

    if (!leads.length) {
      return res.status(400).json({ success: false, message: 'No valid leads found', errors });
    }

    const inserted = await Lead.insertMany(leads, { ordered: false });

    res.json({
      success: true,
      message: `${inserted.length} leads successfully uploaded`,
      total: inserted.length,
      errors: errors.length ? errors : undefined,
    });
  } catch (err) {
    next(err);
  }
};

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
export const getAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const matchStage = { isActive: true };
    if (req.user.role !== 'admin') matchStage.dealer = req.user.id;
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    // Last 30 days ke liye date range
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const trendMatch = { ...matchStage, createdAt: { $gte: thirtyDaysAgo } };

    const [statusStats, projectStats, total, dailyTrend] = await Promise.all([
      Lead.aggregate([{ $match: matchStage }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Lead.aggregate([{ $match: matchStage }, { $group: { _id: '$solarType', count: { $sum: 1 } } }]),
      Lead.countDocuments(matchStage),
      Lead.aggregate([
        { $match: trendMatch },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({ success: true, data: { total, statusStats, projectStats, dailyTrend } });
  } catch (err) {
    next(err);
  }
};
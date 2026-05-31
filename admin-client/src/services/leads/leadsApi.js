import api from '../../api/axios.js';

export const leadsApi = {

  // GET ALL LEADS
  // params: page, limit, project, status, assignedTo, search, startDate, endDate
  getAllLeads: async (params = {}) => {
    const res = await api.get('/leads', { params });
    return res.data;
    // Backend returns: { success, count, total, page, data: [...] }
    // isliye index.jsx mein res.data use karo
  },

  // GET SINGLE LEAD
  getLeadById: async (id) => {
    const res = await api.get(`/leads/${id}`);
    return res.data;
    // Backend returns: { success, data: lead }
  },

  // GET LEADS BY PROJECT SLUG
  getLeadsByProject: async (slug, params = {}) => {
    const res = await api.get(`/leads/project/${slug}`, { params });
    return res.data;
  },

  // CREATE LEAD
  createLead: async (data) => {
    const res = await api.post('/leads', data);
    return res.data;
  },

  // UPDATE LEAD
  updateLead: async (id, data) => {
    const res = await api.put(`/leads/${id}`, data);
    return res.data;
  },

  // ASSIGN LEAD
  assignLead: async (id, assignedTo) => {
    const res = await api.post(`/leads/assign/${id}`, { assignedTo });
    return res.data;
  },

  // DELETE LEAD (soft delete)
  deleteLead: async (id) => {
    const res = await api.delete(`/leads/${id}`);
    return res.data;
  },

  // BULK UPLOAD CSV / XLSX
  uploadLeads: async (formData) => {
    const res = await api.post('/leads/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // ANALYTICS
  getAnalytics: async (params = {}) => {
    const res = await api.get('/leads/analytics', { params });
    return res.data;
  },
};
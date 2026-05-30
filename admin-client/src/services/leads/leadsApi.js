import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/leads';

// Token fetch karo fresh — pehle wala static tha (login ke baad change nahi hota tha)
const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export const leadsApi = {

  // GET ALL LEADS (filters: page, limit, project, status, assignedTo, search, startDate, endDate)
  getAllLeads: async (params = {}) => {
    const res = await axios.get(BASE_URL, { headers: getHeaders(), params });
    return res.data;
  },

  // GET SINGLE LEAD
  getLeadById: async (id) => {
    const res = await axios.get(`${BASE_URL}/${id}`, { headers: getHeaders() });
    return res.data;
  },

  // GET LEADS BY PROJECT SLUG (surya-ghar, group-solar, rwa-society, commercial, village, msme)
  getLeadsByProject: async (slug, params = {}) => {
    const res = await axios.get(`${BASE_URL}/project/${slug}`, {
      headers: getHeaders(),
      params,
    });
    return res.data;
  },

  // CREATE LEAD
  createLead: async (data) => {
    const res = await axios.post(BASE_URL, data, { headers: getHeaders() });
    return res.data;
  },

  // UPDATE LEAD
  updateLead: async (id, data) => {
    const res = await axios.put(`${BASE_URL}/${id}`, data, { headers: getHeaders() });
    return res.data;
  },

  // ASSIGN LEAD
  assignLead: async (id, assignedTo) => {
    const res = await axios.post(
      `${BASE_URL}/assign/${id}`,
      { assignedTo },
      { headers: getHeaders() }
    );
    return res.data;
  },

  // DELETE LEAD
  deleteLead: async (id) => {
    const res = await axios.delete(`${BASE_URL}/${id}`, { headers: getHeaders() });
    return res.data;
  },

  // UPLOAD CSV / XLSX  (project slug optional)
  uploadLeads: async (formData) => {
    const res = await axios.post(`${BASE_URL}/upload`, formData, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // ANALYTICS (params: startDate, endDate)
  getAnalytics: async (params = {}) => {
    const res = await axios.get(`${BASE_URL}/analytics`, {
      headers: getHeaders(),
      params,
    });
    return res.data;
  },
};
import axios from 'axios';

const epcApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

// Attach EPC token to every request
epcApi.interceptors.request.use((config) => {
  const epcData = localStorage.getItem('epcPartner');
  if (epcData) {
    const { token } = JSON.parse(epcData);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 → redirect to EPC login
epcApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('epcPartner');
      window.location.href = '/epc/login';
    }
    return Promise.reject(err);
  }
);

export default epcApi;
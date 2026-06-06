import { createContext, useContext, useState } from 'react';
import epcApi from '../api/epcApi';

const EpcAuthContext = createContext(null);

// ─── MOCK DATA (remove when backend is ready) ────────────────────────
const USE_MOCK = true; // ← bas yahi false karo jab backend ready ho

const MOCK_CREDENTIALS = { email: 'admin@epc.com', password: 'password123' };

const MOCK_USER = {
  token: 'mock-token-xyz',
  partner: {
    id: 'epc-001',
    companyName: 'SolarTech Solutions Pvt Ltd',
    ownerName: 'Rajesh Kumar',
    email: 'admin@epc.com',
    mobile: '9876543210',
    plan: 'Professional',
    state: 'Gujarat',
    district: 'Surat',
    city: 'Surat City',
    yearsOfExperience: 4,
    status: 'approved',
  },
};
// ─────────────────────────────────────────────────────────────────────

export const EpcAuthProvider = ({ children }) => {
  const [epc, setEpc] = useState(() => {
    const stored = localStorage.getItem('epcPartner');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);

    // Mock login
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 700)); // fake delay
      setLoading(false);
      if (email === MOCK_CREDENTIALS.email && password === MOCK_CREDENTIALS.password) {
        localStorage.setItem('epcPartner', JSON.stringify(MOCK_USER));
        setEpc(MOCK_USER);
        return { success: true, data: MOCK_USER };
      }
      return { success: false, message: 'Invalid email or password' };
    }

    // Real API login
    try {
      const { data } = await epcApi.post('/api/epc/auth/login', { email, password });
      localStorage.setItem('epcPartner', JSON.stringify(data));
      setEpc(data);
      return { success: true, data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('epcPartner');
    setEpc(null);
    window.location.href = '/epc/login';
  };

  const updateEpcData = (newData) => {
    const updated = { ...epc, ...newData };
    localStorage.setItem('epcPartner', JSON.stringify(updated));
    setEpc(updated);
  };

  return (
    <EpcAuthContext.Provider value={{ epc, loading, login, logout, updateEpcData }}>
      {children}
    </EpcAuthContext.Provider>
  );
};

export const useEpcAuth = () => {
  const ctx = useContext(EpcAuthContext);
  if (!ctx) throw new Error('useEpcAuth must be used within EpcAuthProvider');
  return ctx;
};
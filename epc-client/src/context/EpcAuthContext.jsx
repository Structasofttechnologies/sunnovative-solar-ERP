import { createContext, useContext, useState } from 'react';
import epcApi from '../api/epcApi';

const EpcAuthContext = createContext(null);

export const EpcAuthProvider = ({ children }) => {
  const [epc, setEpc] = useState(() => {
    const stored = localStorage.getItem('epcPartner');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await epcApi.post('/api/epc/auth/login', { email, password });
      localStorage.setItem('epcPartner', JSON.stringify(data));
      setEpc(data);
      return { success: true, data };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Login failed' 
      };
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
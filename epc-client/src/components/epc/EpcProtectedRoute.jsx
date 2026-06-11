import { Navigate } from 'react-router-dom';
import { useEpcAuth } from '../../context/EpcAuthContext';

const EpcProtectedRoute = ({ children }) => {
  const { epc } = useEpcAuth();
  if (!epc) return <Navigate to="/epc/login" replace />;
  return children;
};

export default EpcProtectedRoute;
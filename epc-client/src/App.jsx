import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EpcRoutes from './routes/EpcRoutes';

function App() {
  return (
    <Router>
      <Routes>
        {/* EPC Portal */}
        <Route path="/epc/*" element={<EpcRoutes />} />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/epc/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
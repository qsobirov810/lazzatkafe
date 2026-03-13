import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import WaiterApp from './pages/WaiterApp';
import AdminApp from './pages/AdminApp';
import Login from './pages/Login';
import QRMenu from './pages/QRMenu';
import ProtectedRoute from './components/ProtectedRoute';
import { DataProvider } from './context/DataContext';

function App() {
  return (
    <DataProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/admin" element={<Navigate to="/" replace />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/system/*" element={(
            <ProtectedRoute>
              <Routes>
                <Route path="waiter" element={<WaiterApp />} />
                <Route path="admin" element={<AdminApp />} />
                <Route path="cashier" element={<AdminApp />} />
                <Route path="*" element={<AdminApp />} />
              </Routes>
            </ProtectedRoute>
          )} />
          <Route path="/menu/:tableId" element={<QRMenu />} />
        </Routes>
      </Router>
    </DataProvider>
  );
}

export default App;

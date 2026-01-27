import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import WaiterApp from './pages/WaiterApp';
import AdminApp from './pages/AdminApp';
import { DataProvider } from './context/DataContext';

function App() {
  return (
    <DataProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/waiter" element={<WaiterApp />} />
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
      </Router>
    </DataProvider>
  );
}

export default App;

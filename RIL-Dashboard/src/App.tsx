import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import Demo from './pages/Demo';
import RouteStub from './pages/RouteStub';
import Login from './pages/Login';
import Orders from './pages/Orders';
import LoadingScreen from './components/Loadingscreen.tsx';

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<RouteStub />} />
        <Route path="/approvals" element={<RouteStub title="Approvals" />} />
        <Route path="/vendors" element={<RouteStub title="Vendors" />} />
        <Route path="/payments" element={<RouteStub title="Payments" />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="*" element={<RouteStub title="Not Found" />} />
      </Routes>
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
    </>
  );
}

export default App;
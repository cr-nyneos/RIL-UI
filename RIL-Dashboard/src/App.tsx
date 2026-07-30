import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Demo from './pages/Demo';
import RouteStub from './pages/RouteStub';
import Login from './pages/Login';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Dashboard />} />
      <Route path="/orders" element={<RouteStub title="Orders" />} />
      <Route path="/orders/:id" element={<RouteStub />} />
      <Route path="/approvals" element={<RouteStub title="Approvals" />} />
      <Route path="/vendors" element={<RouteStub title="Vendors" />} />
      <Route path="/payments" element={<RouteStub title="Payments" />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="*" element={<RouteStub title="Not Found" />} />
    </Routes>
  );
}

export default App;

import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

import Demo from './pages/Demo';
import RouteStub from './pages/RouteStub';
import Login from './pages/Login';
// import LoadingScreen from './components/Loadingscreen.tsx';
import { APP_ROUTES } from './lib/routes';
import LoadingScreen2 from './components/LoadingScreen2.tsx';

function App() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        {APP_ROUTES.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        <Route path="/demo" element={<Demo />} />
        <Route path="*" element={<RouteStub title="Not Found" />} />
      </Routes>
      {loading && (
        <LoadingScreen2
          onComplete={() => {
            setLoading(false);
          }}
        />
      )}
    </>
  );
}

export default App;

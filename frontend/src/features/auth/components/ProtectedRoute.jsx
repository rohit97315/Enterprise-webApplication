import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ allowedRoles }) => {
  const [status, setStatus] = useState('checking'); // 'checking' | 'authorized' | 'unauthorized' | 'forbidden'

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/auth/get-me`, { withCredentials: true })
  // const token = localStorage.getItem('token');
  //   axios.get(`${import.meta.env.VITE_API_URL}/api/auth/get-me`, {
  //       withCredentials: true,
  //       headers: token ? { Authorization: `Bearer ${token}` } : {},
  //     })
      .then((res) => {
        const serverRole = res.data?.user?.role;

        // Keep localStorage in sync with the server's truth, for UI display only
        // (username/role shown in the sidebar) — never trusted for access control.
        localStorage.setItem('user', JSON.stringify(res.data.user));

        if (allowedRoles.includes(serverRole)) {
          setStatus('authorized');
        } else {
          setStatus('forbidden');
        }
      })
      .catch(() => {
        setStatus('unauthorized');
      });
  }, []);

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-500 text-sm">Checking your session...</p>
      </div>
    );
  }

  if (status === 'unauthorized') {
    return <Navigate to="/login" replace />;
  }

  if (status === 'forbidden') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
export default ProtectedRoute;
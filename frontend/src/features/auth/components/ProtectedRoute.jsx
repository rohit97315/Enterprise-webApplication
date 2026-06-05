

import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
const user = location.state?.user || JSON.parse(localStorage.getItem('user'));
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    
    return <Navigate to="/unauthorized" replace />;
  }

  
  return <Outlet />;
};

export default ProtectedRoute;
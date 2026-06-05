
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './features/auth/pages/Login';
import Unauthorized from './features/auth/pages/Unauthorized';
import AdminDashboard from './features/auth/pages/AdminDashboard';
import HRDashboard from './features/auth/pages/HRDashboard';
import EmployeeDashboard from './features/auth/pages/EmployeeDashboard';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import './index.css';

function App() {
  

  return (
       <Router>
      <Routes>
        
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        
        <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        
        <Route element={<ProtectedRoute allowedRoles={['Admin', 'HR_Manager']} />}>
          <Route path="/hr/dashboard" element={<HRDashboard />} />
        </Route>

        
        <Route element={<ProtectedRoute allowedRoles={['Admin', 'HR_Manager', 'Employee']} />}>
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        </Route>

        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
    
    
  )
}

export default App

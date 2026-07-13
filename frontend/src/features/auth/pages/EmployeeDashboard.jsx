
import {ChevronUp} from 'lucide-react';
// import './index.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import EmployeeLeaveManagementView from './EmployeeLeaveManagementView';
// import HRAssistantView from './HRAssistantView';
import { EmployeeLeaveView } from './EmployeeLeaveView';
import EmployeeAssistantView from './EmployeeAssistantView';
import EmployeeHomeView from './EmployeeHomeView';

// const DashboardView = () => <div><h2>🏠 Home Dashboard</h2><p>Welcome back!</p></div>;
// const EmployeesView = () => <div><h2>👤 Employees</h2><p>Manage your employees here.</p></div>;
// const ResumeView = () => <div><h2>⚙️ Resume Screener</h2><p>Screen resumes using AI.</p></div>;
// const CandidatesView = () => <div><h2>👥 Candidates</h2><p>Manage your candidates here.</p></div>;
// const LeaveManagementView = () => <div><h2>� Leave Management</h2><p>Manage your leave requests here.</p></div>;
// const HRAssistantView = () => <div><h2>⚙️ Settings</h2><p>Tweak your application preferences.</p></div>;

const EmployeeDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  

    

    
    const storedUser = JSON.parse(localStorage.getItem('user'));
    
   
    const username = storedUser?.username || 'Employee';


        const renderContent = () => {
            switch(activeTab) {
                case 'dashboard': return <EmployeeHomeView />;
                case 'leave': return <EmployeeLeaveView/>;
                case 'assistant': return <EmployeeAssistantView />;
                // case 'employees': return <EmployeesView />;
                // case 'resume': return <ResumeView />;
                // case 'candidates': return <CandidatesView />;
                
                default: return <EmployeeHomeView />;
            }
        }
  return (
    <div className="flex min-h-screen w-full bg-[#1e1e20] text-gray-200 font-sans overflow-hidden">
  
    
  <aside className="w-64 bg-[#262629] border-r border-[#323235] flex flex-col justify-between min-h-screen">
    
    
    <div>
      
      <div className="pt-6 pb-4 px-6">
        <h1 className="font-bold text-white text-lg tracking-wide">DEVGuard HR</h1>
        <p className="text-xs text-gray-400 mt-0.5">Enterprise</p>
      </div>

      
      <div className="px-3 py-2">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3 mb-3">
          Main Menu
        </p>
        
        <nav className="space-y-1">
          
          <div className="w-full px-1">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="w-full text-left px-3 py-2 rounded-md transition-all text-sm font-medium"
              style={{ 
                backgroundColor: activeTab === 'dashboard' ? '#2563eb' : 'transparent', 
                color: '#fff',
                fontWeight: activeTab === 'dashboard' ? 'bold' : 'normal'
              }}
            >
              Dashboard
            </button>
          </div>

          
          {/* <div className="w-full px-1">
            <button 
              onClick={() => setActiveTab('employees')}
              className="w-full text-left px-3 py-2 rounded-md transition-all text-sm font-medium"
              style={{ 
                backgroundColor: activeTab === 'employees' ? '#2563eb' : 'transparent', 
                color: '#fff',
                fontWeight: activeTab === 'employees' ? 'bold' : 'normal'
              }}
            >
              Employees
            </button>
          </div> */}

          
          {/* <div className="w-full px-1">
            <button 
              onClick={() => setActiveTab('resume')}
              className="w-full text-left px-3 py-2 rounded-md transition-all text-sm font-medium flex items-center justify-between"
              style={{ 
                backgroundColor: activeTab === 'resume' ? '#2563eb' : 'transparent', 
                color: '#fff',
                fontWeight: activeTab === 'resume' ? 'bold' : 'normal'
              }}
            >
              <span>Resume Screener</span>
              <span className="bg-blue-900/50 text-blue-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-800/30">AI</span>
            </button>
          </div> */}
          
          
          {/* <div className="w-full px-1">
            <button 
              onClick={() => setActiveTab('candidates')}
              className="w-full text-left px-3 py-2 rounded-md transition-all text-sm font-medium"
              style={{ 
                backgroundColor: activeTab === 'candidates' ? '#2563eb' : 'transparent', 
                color: '#fff',
                fontWeight: activeTab === 'candidates' ? 'bold' : 'normal'
              }}
            >
              Candidates
            </button>
          </div> */}

         
          <div className="w-full px-1">
            <button 
              onClick={() => setActiveTab('leave')}
              className="w-full text-left px-3 py-2 rounded-md transition-all text-sm font-medium"
              style={{ 
                backgroundColor: activeTab === 'leave' ? '#2563eb' : 'transparent', 
                color: '#fff',
                fontWeight: activeTab === 'leave' ? 'bold' : 'normal'
              }}
            >
              Leave Management
            </button>
          </div>

          
          <div className="w-full px-1">
            <button 
              onClick={() => setActiveTab('assistant')}
              className="w-full text-left px-3 py-2 rounded-md transition-all text-sm font-medium flex items-center justify-between"
              style={{ 
                backgroundColor: activeTab === 'assistant' ? '#2563eb' : 'transparent', 
                color: '#fff',
                fontWeight: activeTab === 'assistant' ? 'bold' : 'normal'
              }}
            >
              <span>HR Assistant</span>
              <span className="bg-blue-900/50 text-blue-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-800/30">AI</span>
            </button>
          </div>
        </nav>
      </div>
    </div>

    
    <div className="p-4 border-t border-[#323235] flex items-center justify-between bg-[#232326]">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-inner p-1">
          
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white leading-tight">{username}</h4>
          <span className="inline-block bg-blue-950 text-blue-400 text-[10px] px-2 py-0.5 rounded-full mt-0.5 font-medium border border-blue-900/50">
            Employee
          </span>
        </div>
      </div>
      <ChevronUp size={16} className="text-gray-500 cursor-pointer hover:text-gray-300" onClick={() => setShowLogoutPopup(true)}/>
    </div>
  </aside>

  <main className="flex-1 flex flex-col overflow-y-auto min-h-screen">
    {renderContent()}
  </main>

{showLogoutPopup && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

    <div className="bg-[#262629] border border-[#323235] w-full max-w-sm p-6 rounded-xl shadow-2xl text-gray-200 text-center relative">

      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-950/50 border border-red-900/40 mb-4">
        <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </div>

      <h3 className="text-lg font-bold text-white mb-1">Confirm Logout</h3>
      <p className="text-xs text-gray-400 mb-6">
        Are you sure you want to sign out of DEVGuard HR? You will be redirected to the login page.
      </p>

      <div className="flex flex-col space-y-2">
        <button
          onClick={() => {
            localStorage.clear(); 
            sessionStorage.clear();
            setShowLogoutPopup(false);
            navigate('/');
          }}
          className="w-full bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Log Out
        </button>
        
        <button
          onClick={() => setShowLogoutPopup(false)}
          className="w-full bg-[#1e1e20] hover:bg-[#323235] text-gray-400 hover:text-white py-2 rounded-lg text-sm font-medium transition-colors border border-[#323235]"
        >
          Cancel
        </button>
      </div>

    </div>
  </div>
)}
</div>
  )
}

export default EmployeeDashboard

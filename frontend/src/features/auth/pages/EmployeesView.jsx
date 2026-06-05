import  { useState,useEffect } from 'react';

const initialEmployees = [
  { id: 'EMP-0001', name: 'Jordan Lee', initials: 'JL', bgColor: 'bg-blue-900/40 text-blue-300', role: 'Senior Engineer', dept: 'Engineering', email: 'jordan@devguard.com', status: 'Active', salary: '$124,000' },
  { id: 'EMP-0002', name: 'Maya Chen', initials: 'MC', bgColor: 'bg-purple-900/40 text-purple-300', role: 'Product Manager', dept: 'Product', email: 'maya@devguard.com', status: 'Active', salary: '$118,000' },
  { id: 'EMP-0003', name: 'Sam Williams', initials: 'SW', bgColor: 'bg-emerald-900/40 text-emerald-300', role: 'UX Designer', dept: 'Design', email: 'sam@devguard.com', status: 'On leave', salary: '$98,000' },
];

export default function EmployeesView() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeCounter, setEmployeeCounter] = useState(initialEmployees.length);
  
  const [formData, setFormData] = useState({
    name: '', role: '', dept: '', email: '', status: 'Active', salary: ''
  });


  useEffect(() => {
    localStorage.setItem('devguard_employees', JSON.stringify(employees));
  }, [employees]);

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-emerald-950 text-emerald-300 border border-emerald-800/50';
      case 'on leave': return 'bg-amber-950 text-amber-300 border border-amber-800/50';
      case 'probation': return 'bg-sky-950 text-sky-300 border border-sky-800/50';
      default: return 'bg-zinc-800 text-zinc-400';
    }
  };

  const handleAddEmployee = (e) => {
    e.preventDefault();
    
    const initials = formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    
    const colors = [
      'bg-blue-900/40 text-blue-300', 
      'bg-purple-900/40 text-purple-300', 
      'bg-emerald-900/40 text-emerald-300',
      'bg-rose-900/40 text-rose-300'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newEmp = {
      id: `EMP-000${employees.length + 1}`, 
      name: formData.name,
      initials: initials || 'EE',
      bgColor: randomColor,
      role: formData.role,
      dept: formData.dept,
      email: formData.email,
      status: formData.status,
      salary: formData.salary ? `$${Number(formData.salary).toLocaleString()}` : '$0'
    };

    setEmployees([...employees, newEmp]);
    setEmployeeCounter(employees.length + 1);
    setIsModalOpen(false); // 
    setFormData({ name: '', role: '', dept: '', email: '', status: 'Active', salary: '' }); // Clean values
  };

  return (
    <>
    <div className='w-full max-w-5xl mx-auto p-6'>
        <h1 className='text-2xl font-bold text-zinc-200'>Employee Directory</h1>
        <h1 className='text-lg text-zinc-400'>{employeeCounter} total Employees</h1>
    </div>




    <div className="w-full max-w-5xl mx-auto p-6 bg-[#18181b] rounded-xl border border-zinc-800 shadow-2xl text-zinc-300 font-sans relative">
   
      {/* 1. FILTER BAR PANEL WITH ACTION BUTTON */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-stretch sm:items-center justify-between">
        <div className="flex flex-wrap gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <input type="text" placeholder="Search..." className="w-full pl-4 pr-4 py-2 bg-[#202024] border border-zinc-800 rounded-lg text-sm" />
          </div>
          {/* Dept Filter Dropdown */}
          <select className="px-4 py-2 bg-[#202024] border border-zinc-800 rounded-lg text-sm cursor-pointer"><option>All departments</option><option>Engineering</option><option>Product</option><option>Design</option><option>Finance</option></select>
          {/* Status Filter Dropdown */}
          <select className="px-4 py-2 bg-[#202024] border border-zinc-800 rounded-lg text-sm cursor-pointer"><option>All statuses</option><option>Active</option><option>On leave</option><option>Probation</option></select>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-sm px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
          Add Employee
        </button>
      </div>

      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
              <th className="pb-3">Employee</th>
              <th className="pb-3">Role & Dept</th>
              <th className="pb-3">Email</th>
              <th className="pb-3">Status</th>
              <th className="pb-3 text-right">Salary</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-zinc-800/20 transition-colors group">
                <td className="py-3.5 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${emp.bgColor}`}>{emp.initials}</div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-200 group-hover:text-white">{emp.name}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{emp.id}</div>
                  </div>
                </td>
                <td className="py-3.5">
                  <div className="text-sm font-medium text-zinc-300">{emp.role}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{emp.dept}</div>
                </td>
                <td className="py-3.5 text-sm text-zinc-400 font-mono">{emp.email}</td>
                <td className="py-3.5">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(emp.status)}`}>{emp.status}</span>
                </td>
                <td className="py-3.5 text-sm font-medium text-zinc-200 text-right font-mono">{emp.salary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity animate-fadeIn">
          <div className="bg-[#1c1c21] border border-zinc-800 w-full max-w-md rounded-xl p-6 shadow-2xl text-zinc-200 transform scale-100 transition-transform">
            <h2 className="text-lg font-bold text-white mb-4">Add New Employee</h2>
            
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-[#252529] border border-zinc-800 focus:border-zinc-700 focus:outline-none rounded-lg text-sm" placeholder="e.g. Jordan Lee" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">Role</label>
                  <input required type="text" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full px-3 py-2 bg-[#252529] border border-zinc-800 focus:border-zinc-700 focus:outline-none rounded-lg text-sm" placeholder="Senior Engineer" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">Department</label>
                  <input required type="text" value={formData.dept} onChange={(e) => setFormData({...formData, dept: e.target.value})} className="w-full px-3 py-2 bg-[#252529] border border-zinc-800 focus:border-zinc-700 focus:outline-none rounded-lg text-sm" placeholder="Engineering" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 bg-[#252529] border border-zinc-800 focus:border-zinc-700 focus:outline-none rounded-lg text-sm" placeholder="name@devguard.com" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 bg-[#252529] border border-zinc-800 rounded-lg text-sm cursor-pointer">
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Probation">Probation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">Annual Salary ($)</label>
                  <input required type="number" value={formData.salary} onChange={(e) => setFormData({...formData, salary: e.target.value})} className="w-full px-3 py-2 bg-[#252529] border border-zinc-800 focus:border-zinc-700 focus:outline-none rounded-lg text-sm font-mono" placeholder="105000" />
                </div>
              </div>

             
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-sm font-medium rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 text-sm font-semibold rounded-lg transition-colors">Save Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
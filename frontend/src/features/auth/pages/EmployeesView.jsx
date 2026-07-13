import { useState, useEffect } from 'react';
import axios from 'axios';

const COLOR_PALETTE = [
  'bg-blue-900/40 text-blue-300',
  'bg-purple-900/40 text-purple-300',
  'bg-emerald-900/40 text-emerald-300',
  'bg-rose-900/40 text-rose-300',
  'bg-amber-900/40 text-amber-300',
];

function getInitials(name) {
  return (name || '')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'EE';
}

function getColorFor(name) {
  const index = (name || '').charCodeAt(0) % COLOR_PALETTE.length;
  return COLOR_PALETTE[index] || COLOR_PALETTE[0];
}

export default function EmployeesView() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All roles');
  const [statusFilter, setStatusFilter] = useState('All statuses');

  const [formData, setFormData] = useState({
    username: '', email: '', password: '', role: 'Employee'
  });

  const fetchEmployees = () => {
    setLoading(true);
    axios.get('http://localhost:3000/api/auth/employees', { withCredentials: true })
      .then(res => {
        setEmployees(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load employees.');
        setLoading(false);
      });
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEmployees();
  }, []);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, formData, { withCredentials: true });
      setIsModalOpen(false);
      setFormData({ username: '', email: '', password: '', role: 'Employee' });
      fetchEmployees(); // refresh so the new employee shows up immediately
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to add employee.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = employees.filter(emp => {
    const matchesSearch =
      emp.username.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'All roles' || emp.role === roleFilter;
    const matchesStatus = statusFilter === 'All statuses' || emp.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusStyle = (status) => {
    return status === 'On Leave'
      ? 'bg-amber-950 text-amber-300 border border-amber-800/50'
      : 'bg-emerald-950 text-emerald-300 border border-emerald-800/50';
  };

  return (
    <>
      <div className='w-full max-w-5xl mx-auto p-6'>
        <h1 className='text-2xl font-bold text-zinc-200'>Employee Directory</h1>
        <h1 className='text-lg text-zinc-400'>{employees.length} total Employees</h1>
      </div>

      <div className="w-full max-w-5xl mx-auto p-6 bg-[#18181b] rounded-xl border border-zinc-800 shadow-2xl text-zinc-300 font-sans relative">

        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-stretch sm:items-center justify-between">
          <div className="flex flex-wrap gap-3 flex-1">
            <div className="relative flex-1 max-w-xs">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-4 pr-4 py-2 bg-[#202024] border border-zinc-800 rounded-lg text-sm"
              />
            </div>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-4 py-2 bg-[#202024] border border-zinc-800 rounded-lg text-sm cursor-pointer">
              <option>All roles</option>
              <option>Admin</option>
              <option>HR_Manager</option>
              <option>Employee</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 bg-[#202024] border border-zinc-800 rounded-lg text-sm cursor-pointer">
              <option>All statuses</option>
              <option>Active</option>
              <option>On Leave</option>
            </select>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-sm px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
            Add Employee
          </button>
        </div>

        {loading ? (
          <p className="text-zinc-500 text-sm py-6 text-center">Loading employees...</p>
        ) : error ? (
          <p className="text-red-400 text-sm py-6 text-center">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="text-zinc-500 text-sm py-6 text-center">No employees match your filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
                  <th className="pb-3">Employee</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Joined</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filtered.map((emp) => (
                  <tr key={emp._id} className="hover:bg-zinc-800/20 transition-colors group">
                    <td className="py-3.5 flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${getColorFor(emp.username)}`}>
                        {getInitials(emp.username)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-zinc-200 group-hover:text-white">{emp.username}</div>
                        <div className="text-xs text-zinc-500 mt-0.5">{emp.employeeId}</div>
                      </div>
                    </td>
                    <td className="py-3.5 text-sm font-medium text-zinc-300">{emp.role}</td>
                    <td className="py-3.5 text-sm text-zinc-400 font-mono">{emp.email}</td>
                    <td className="py-3.5 text-sm text-zinc-400">{new Date(emp.joinedAt).toLocaleDateString()}</td>
                    <td className="py-3.5 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(emp.status)}`}>{emp.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1c1c21] border border-zinc-800 w-full max-w-md rounded-xl p-6 shadow-2xl text-zinc-200">
              <h2 className="text-lg font-bold text-white mb-4">Add New Employee</h2>

              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">Username</label>
                  <input required type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full px-3 py-2 bg-[#252529] border border-zinc-800 focus:border-zinc-700 focus:outline-none rounded-lg text-sm" placeholder="e.g. jordan.lee" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 bg-[#252529] border border-zinc-800 focus:border-zinc-700 focus:outline-none rounded-lg text-sm" placeholder="name@devguard.com" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">Temporary Password</label>
                  <input required type="text" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-3 py-2 bg-[#252529] border border-zinc-800 focus:border-zinc-700 focus:outline-none rounded-lg text-sm" placeholder="Employee should change this after first login" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">Role</label>
                  <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-3 py-2 bg-[#252529] border border-zinc-800 rounded-lg text-sm cursor-pointer">
                    <option value="Employee">Employee</option>
                    <option value="HR_Manager">HR Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                {submitError && <p className="text-red-400 text-sm">{submitError}</p>}

                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-sm font-medium rounded-lg transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-zinc-100 hover:bg-white disabled:opacity-50 text-zinc-950 text-sm font-semibold rounded-lg transition-colors">
                    {isSubmitting ? 'Saving...' : 'Save Employee'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
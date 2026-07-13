import { useState, useEffect } from 'react';
import axios from 'axios';

const EmployeeHomeView = ({ onNavigate }) => {
    const [leaves, setLeaves] = useState([]);
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect( () => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        // setUsername(storedUser?.username || 'Employee');
        setUsername(storedUser?.username || 'Employee');
        

        axios.get(`${import.meta.env.VITE_API_URL}/api/leave/my-leaves`, { withCredentials: true })
            .then(res => {
                setLeaves(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const total = leaves.length;
    const approved = leaves.filter(l => l.status === 'Approved').length;
    const pending = leaves.filter(l => l.status === 'Pending').length;
    const rejected = leaves.filter(l => l.status === 'Rejected').length;
    const recent = [...leaves]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    const statCards = [
        { title: 'Total Requests', value: total, color: 'text-white' },
        { title: 'Approved', value: approved, color: 'text-emerald-400' },
        { title: 'Pending', value: pending, color: 'text-amber-400' },
        { title: 'Rejected', value: rejected, color: 'text-red-400' },
    ];

    return (
        <div className="p-6 bg-zinc-950 min-h-screen text-zinc-100 space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Welcome back, {username} 👋</h2>
                <p className="text-zinc-400 mt-1">Here's a quick look at your leave activity.</p>
            </div>

            {/* PERSONAL STAT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, index) => (
                    <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 shadow-lg shadow-black/20" key={index}>
                        <h4 className="text-sm font-medium text-zinc-400">{card.title}</h4>
                        <h2 className={`text-3xl font-bold mt-2 ${card.color}`}>{card.value}</h2>
                    </div>
                ))}
            </div>

            {/* QUICK ACTIONS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                    onClick={() => onNavigate && onNavigate('leave')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl p-5 text-left transition-colors"
                >
                    <h3 className="text-lg font-semibold">Apply for Leave</h3>
                    <p className="text-sm text-emerald-100/80 mt-1">Submit a new leave request</p>
                </button>
                <button
                    onClick={() => onNavigate && onNavigate('assistant')}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl p-5 text-left transition-colors"
                >
                    <h3 className="text-lg font-semibold">Ask the Assistant</h3>
                    <p className="text-sm text-blue-100/80 mt-1">Check leave status or ask about policy</p>
                </button>
            </div>

            {/* RECENT REQUESTS */}
            <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 shadow-lg shadow-black/20">
                <h3 className="text-lg font-semibold mb-4 text-white">Recent Leave Requests</h3>
                {loading ? (
                    <p className="text-zinc-500 text-sm">Loading...</p>
                ) : recent.length === 0 ? (
                    <p className="text-zinc-500 text-sm">No leave requests yet.</p>
                ) : (
                    <div className="divide-y divide-zinc-800">
                        {recent.map((leave) => (
                            <div className="flex justify-between items-center py-3 first:pt-0 last:pb-0" key={leave._id}>
                                <div>
                                    <h4 className="font-medium text-zinc-100 text-sm">{leave.leaveType}</h4>
                                    <p className="text-xs text-zinc-400">{leave.days} day(s) — {leave.reason}</p>
                                </div>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                    leave.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' :
                                    leave.status === 'Rejected' ? 'bg-red-500/10 text-red-400' :
                                    'bg-amber-500/10 text-amber-400'
                                }`}>
                                    {leave.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeHomeView;
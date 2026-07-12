import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid
} from "recharts";

const COLORS = ["#6366F1", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function DashboardView() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3000/api/leave/dashboard-stats', { withCredentials: true })
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load dashboard data.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-zinc-950 min-h-screen text-zinc-100">
        <p className="text-zinc-400">Loading dashboard...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 bg-zinc-950 min-h-screen text-zinc-100">
        <p className="text-red-400">{error || "No data available."}</p>
      </div>
    );
  }

  const pendingCount = stats.statusBreakdown.find(s => s.name === 'Pending')?.value || 0;
  const approvedCount = stats.statusBreakdown.find(s => s.name === 'Approved')?.value || 0;

  const statCards = [
    { title: "Total Employees", value: stats.totalEmployees },
    { title: "Total Leave Requests", value: stats.totalLeaveRequests },
    { title: "Pending Approvals", value: pendingCount },
    { title: "Approved Requests", value: approvedCount },
    { title: "On Leave Today", value: stats.onLeaveToday },
  ];

  return (
    <div className="p-6 bg-zinc-950 min-h-screen text-zinc-100 space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-white">HR Dashboard</h2>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, index) => (
          <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 flex flex-col justify-between shadow-lg shadow-black/20" key={index}>
            <h4 className="text-sm font-medium text-zinc-400">{card.title}</h4>
            <h2 className="text-2xl font-bold text-white mt-4">{card.value}</h2>
          </div>
        ))}
      </div>

      {/* CHARTS ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 shadow-lg shadow-black/20">
          <h3 className="text-lg font-semibold mb-4 text-white">Leave Requests Trend (last 6 months)</h3>
          {stats.monthlyTrend.length === 0 ? (
            <p className="text-zinc-500 text-sm">Not enough data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.monthlyTrend}>
                <XAxis dataKey="month" stroke="#71717A" fontSize={12} tickLine={false} />
                <YAxis stroke="#71717A" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: "#18181B", borderColor: "#27272A", color: "#F4F4F5" }} />
                <Line type="monotone" dataKey="requests" stroke="#6366F1" strokeWidth={3} dot={{ fill: "#6366F1" }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 shadow-lg shadow-black/20">
          <h3 className="text-lg font-semibold mb-4 text-white">Leave Status Breakdown</h3>
          {stats.statusBreakdown.length === 0 ? (
            <p className="text-zinc-500 text-sm">Not enough data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.statusBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                <XAxis dataKey="name" stroke="#71717A" fontSize={12} tickLine={false} />
                <YAxis stroke="#71717A" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: "#18181B", borderColor: "#27272A", color: "#F4F4F5" }} />
                <Bar dataKey="value" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* CHARTS ROW 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 shadow-lg shadow-black/20">
          <h3 className="text-lg font-semibold mb-4 text-white">Role Distribution</h3>
          {stats.roleDistribution.length === 0 ? (
            <p className="text-zinc-500 text-sm">Not enough data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={stats.roleDistribution} dataKey="value" outerRadius={100} label={{ fill: '#A1A1AA', fontSize: 12 }}>
                  {stats.roleDistribution.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#18181B", borderColor: "#27272A", color: "#F4F4F5" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 shadow-lg shadow-black/20">
          <h3 className="text-lg font-semibold mb-4 text-white">Leave Type Distribution</h3>
          {stats.leaveTypeBreakdown.length === 0 ? (
            <p className="text-zinc-500 text-sm">Not enough data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={stats.leaveTypeBreakdown} dataKey="value" innerRadius={60} outerRadius={100} label={{ fill: '#A1A1AA', fontSize: 12 }}>
                  {stats.leaveTypeBreakdown.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#18181B", borderColor: "#27272A", color: "#F4F4F5" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* LIST SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Recent Leave Requests */}
        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 flex flex-col shadow-lg shadow-black/20">
          <h3 className="text-lg font-semibold mb-4 text-white">Recent Leave Requests</h3>
          {stats.recentLeaves.length === 0 ? (
            <p className="text-zinc-500 text-sm">No leave requests yet.</p>
          ) : (
            <div className="divide-y divide-zinc-800">
              {stats.recentLeaves.map((leave) => (
                <div className="flex justify-between items-center py-3 first:pt-0 last:pb-0" key={leave._id}>
                  <div>
                    <h4 className="font-medium text-zinc-100 text-sm">{leave.username}</h4>
                    <p className="text-xs text-zinc-400">{leave.leaveType} — {leave.days} day(s)</p>
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

        {/* Top Leave Takers */}
        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 flex flex-col shadow-lg shadow-black/20">
          <h3 className="text-lg font-semibold mb-4 text-white">Top Leave Takers</h3>
          {stats.topLeaveTakers.length === 0 ? (
            <p className="text-zinc-500 text-sm">No leave data yet.</p>
          ) : (
            <div className="divide-y divide-zinc-800">
              {stats.topLeaveTakers.map((emp, index) => (
                <div className="flex justify-between items-center py-3 first:pt-0 last:pb-0" key={index}>
                  <h4 className="font-medium text-zinc-100 text-sm">{emp.username}</h4>
                  <span className="text-xs font-semibold px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20">
                    {emp.days} day(s)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Joined Employees */}
        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 flex flex-col shadow-lg shadow-black/20">
          <h3 className="text-lg font-semibold mb-4 text-white">Recently Joined</h3>
          {stats.recentlyJoined.length === 0 ? (
            <p className="text-zinc-500 text-sm">No employees yet.</p>
          ) : (
            <div className="divide-y divide-zinc-800">
              {stats.recentlyJoined.map((emp) => (
                <div className="flex justify-between items-center py-3 first:pt-0 last:pb-0" key={emp._id}>
                  <div>
                    <h4 className="font-medium text-zinc-100 text-sm">{emp.username}</h4>
                    <p className="text-xs text-zinc-400">{emp.role}</p>
                  </div>
                  <span className="text-xs text-zinc-500 font-medium">
                    {new Date(emp.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
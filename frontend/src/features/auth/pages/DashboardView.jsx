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

const statCards = [
  { title: "Total Employees", value: "8,452", change: "+3.6%", isPositive: true },
  { title: "Open Positions", value: "267", change: "-5.2%", isPositive: false },
  { title: "Attrition Rate", value: "12.4%", change: "-1.3%", isPositive: false },
  { title: "Employee Satisfaction", value: "4.2 / 5", change: "+6.7%", isPositive: true },
  { title: "Training Completion", value: "76.8%", change: "+8.2%", isPositive: true },
];

const employeeTrend = [
  { month: "Jan", employees: 7900 },
  { month: "Feb", employees: 8100 },
  { month: "Mar", employees: 8200 },
  { month: "Apr", employees: 8400 },
  { month: "May", employees: 8452 },
];

const departmentData = [
  { name: "Technology", value: 35 },
  { name: "Operations", value: 25 },
  { name: "Sales", value: 20 },
  { name: "Marketing", value: 10 },
  { name: "Finance", value: 6 },
  { name: "HR", value: 4 },
];

const attritionData = [
  { department: "Technology", value: 17 },
  { department: "Sales", value: 14 },
  { department: "Operations", value: 12 },
  { department: "Marketing", value: 10 },
  { department: "Finance", value: 8 },
  { department: "HR", value: 7 },
];

const ageData = [
  { name: "<25", value: 12 },
  { name: "25-34", value: 38 },
  { name: "35-44", value: 28 },
  { name: "45-54", value: 16 },
  { name: "55+", value: 6 },
];

// Refined chart colors adjusted for high contrast on dark backgrounds
const COLORS = [
  "#6366F1", // Indigo
  "#06B6D4", // Cyan
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Violet
];

const recentHires = [
  { name: "John Smith", role: "Frontend Developer", date: "12 Jun 2025" },
  { name: "Emma Watson", role: "HR Executive", date: "10 Jun 2025" },
  { name: "David Lee", role: "Backend Developer", date: "08 Jun 2025" },
];

const upcomingReviews = [
  { name: "Michael Brown", date: "20 Jun" },
  { name: "Sophia Wilson", date: "22 Jun" },
  { name: "Daniel Clark", date: "25 Jun" },
];

const topEmployee = {
  name: "Sarah Johnson",
  department: "Engineering",
  rating: "⭐ 4.9",
};

export default function DashboardView() {
  return (
    <div className="p-6 bg-zinc-950 min-h-screen text-zinc-100 space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-white">HR Dashboard</h2>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, index) => (
          <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 flex flex-col justify-between shadow-lg shadow-black/20" key={index}>
            <h4 className="text-sm font-medium text-zinc-400">{card.title}</h4>
            <div className="flex items-baseline justify-between mt-4">
              <h2 className="text-2xl font-bold text-white">{card.value}</h2>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                card.isPositive 
                  ? "bg-emerald-500/10 text-emerald-400" 
                  : "bg-red-500/10 text-red-400"
              }`}>
                {card.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 shadow-lg shadow-black/20">
          <h3 className="text-lg font-semibold mb-4 text-white">Employee Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={employeeTrend}>
              <XAxis dataKey="month" stroke="#71717A" fontSize={12} tickLine={false} />
              <YAxis stroke="#71717A" fontSize={12} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "#18181B", borderColor: "#27272A", color: "#F4F4F5" }} />
              <Line
                type="monotone"
                dataKey="employees"
                stroke="#6366F1"
                strokeWidth={3}
                dot={{ fill: "#6366F1" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 shadow-lg shadow-black/20">
          <h3 className="text-lg font-semibold mb-4 text-white">Attrition by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attritionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
              <XAxis dataKey="department" stroke="#71717A" fontSize={12} tickLine={false} />
              <YAxis stroke="#71717A" fontSize={12} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "#18181B", borderColor: "#27272A", color: "#F4F4F5" }} />
              <Bar dataKey="value" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHARTS ROW 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 shadow-lg shadow-black/20">
          <h3 className="text-lg font-semibold mb-4 text-white">Employee Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentData}
                dataKey="value"
                outerRadius={100}
                label={{ fill: '#A1A1AA', fontSize: 12 }}
              >
                {departmentData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 shadow-lg shadow-black/20">
          <h3 className="text-lg font-semibold mb-4 text-white">Age Group Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ageData}
                dataKey="value"
                innerRadius={60}
                outerRadius={100}
                label={{ fill: '#A1A1AA', fontSize: 12 }}
              >
                {ageData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* EMPLOYEE SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Recent New Hires */}
        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 flex flex-col justify-between shadow-lg shadow-black/20">
          <h3 className="text-lg font-semibold mb-4 text-white">Recent New Hires</h3>
          <div className="divide-y divide-zinc-800 flex-1 flex flex-col justify-center">
            {recentHires.map((emp, index) => (
              <div className="flex justify-between items-center py-3 first:pt-0 last:pb-0" key={index}>
                <div>
                  <h4 className="font-medium text-zinc-100 text-sm">{emp.name}</h4>
                  <p className="text-xs text-zinc-400">{emp.role}</p>
                </div>
                <span className="text-xs text-zinc-500 font-medium">{emp.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Reviews */}
        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 flex flex-col justify-between shadow-lg shadow-black/20">
          <h3 className="text-lg font-semibold mb-4 text-white">Upcoming Reviews</h3>
          <div className="divide-y divide-zinc-800 flex-1 flex flex-col justify-center">
            {upcomingReviews.map((emp, index) => (
              <div className="flex justify-between items-center py-[14px] first:pt-0 last:pb-0" key={index}>
                <h4 className="font-medium text-zinc-100 text-sm">{emp.name}</h4>
                <span className="text-xs font-semibold px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20">
                  {emp.date}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Employee of the Month */}
        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 flex flex-col shadow-lg shadow-black/20">
          <h3 className="text-lg font-semibold mb-4 text-white">Employee of the Month</h3>
          <div className="bg-gradient-to-br from-indigo-950/40 to-zinc-900 border border-indigo-500/20 rounded-xl p-6 text-center flex flex-col justify-center flex-1">
            <h2 className="text-xl font-bold text-white">{topEmployee.name}</h2>
            <p className="text-sm text-indigo-400 font-medium mt-1">{topEmployee.department}</p>
            <h3 className="text-lg font-bold mt-4 bg-zinc-800 inline-block mx-auto px-3 py-1 rounded-full border border-zinc-700 shadow-md text-white">
              {topEmployee.rating}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}
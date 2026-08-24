import React, { useState, useEffect } from 'react';
import { 
  TrendingUp,
  Briefcase,
  FileEdit,
  UserPlus
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { toast } from 'react-toastify';

// Default chart data as fallback
const defaultChartData = [
  { name: 'May 1', value: 20 },
  { name: 'May 8', value: 45 },
  { name: 'May 15', value: 35 },
  { name: 'May 22', value: 55 },
  { name: 'May 29', value: 45 },
  { name: 'Jun 5', value: 70 },
  { name: 'Jun 12', value: 55 },
  { name: 'Jun 19', value: 90 },
];

// We will construct pieData dynamically in the component

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

const DashboardHome = () => {
  const [stats, setStats] = useState({
    totals: { enquiries: 0, projects: 0, blogs: 0, teamMembers: 0 },
    projectStatusCounts: { completed: 0, inProgress: 0, pending: 0 },
    recentEnquiries: [],
    recentProjects: [],
    enquiriesChartData: []
  });
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/admin/dashboard-stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        setStats(result);
      } else {
        toast.error('Failed to load dashboard stats');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error loading dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center text-slate-500 font-semibold">Loading dashboard data...</div>;
  }

  const pieData = [
    { name: 'Completed', value: stats.projectStatusCounts.completed, color: '#10b981' },
    { name: 'In Progress', value: stats.projectStatusCounts.inProgress, color: '#3b82f6' },
    { name: 'Pending', value: stats.projectStatusCounts.pending, color: '#f59e0b' },
  ];

  return (
    <div className="p-4 sm:p-8">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">Total Enquiries</p>
              <h3 className="text-3xl font-bold text-slate-800">{stats.totals.enquiries}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
              <TrendingUp size={24} />
            </div>
          </div>
          <p className="text-sm mt-4 font-medium"><span className="text-emerald-500">Live</span> <span className="text-slate-400">total from database</span></p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">Total Projects</p>
              <h3 className="text-3xl font-bold text-slate-800">{stats.totals.projects}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
              <Briefcase size={24} />
            </div>
          </div>
          <p className="text-sm mt-4 font-medium"><span className="text-emerald-500">Live</span> <span className="text-slate-400">total from database</span></p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">Blog Posts</p>
              <h3 className="text-3xl font-bold text-slate-800">{stats.totals.blogs}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
              <FileEdit size={24} />
            </div>
          </div>
          <p className="text-sm mt-4 font-medium"><span className="text-emerald-500">Live</span> <span className="text-slate-400">total from database</span></p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">Team Members</p>
              <h3 className="text-3xl font-bold text-slate-800">{stats.totals.teamMembers}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
              <UserPlus size={24} />
            </div>
          </div>
          <p className="text-sm mt-4 font-medium"><span className="text-emerald-500">Live</span> <span className="text-slate-400">total from database</span></p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Line Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 text-lg">Enquiries Overview</h3>
            <select className="border border-slate-200 rounded-lg text-sm px-3 py-1.5 text-slate-600 focus:outline-none">
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.enquiriesChartData && stats.enquiriesChartData.length > 0 ? stats.enquiriesChartData : defaultChartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-800 text-lg mb-6">Projects Status</h3>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <div className="h-48 w-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-slate-800">{stats.totals.projects}</span>
                <span className="text-xs text-slate-500 font-medium">Total</span>
              </div>
            </div>
            
            <div className="w-full mt-8 space-y-3">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></span>
                    <span className="text-slate-600 font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-800">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lists Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Enquiries */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 text-lg">Recent Enquiries</h3>
          </div>
          
          <div className="space-y-5">
            {stats.recentEnquiries.length === 0 ? (
              <p className="text-slate-500 text-sm">No recent enquiries found.</p>
            ) : (
              stats.recentEnquiries.map((enq) => (
                <div key={enq._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold border border-slate-200">
                      {enq.fullName ? enq.fullName.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 max-w-[150px] truncate">{enq.fullName || 'Unknown'}</p>
                      <p className="text-xs text-slate-500">{enq.service || 'General Enquiry'}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-400 shrink-0">{timeAgo(enq.createdAt)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 text-lg">Recent Projects</h3>
          </div>
          
          <div className="space-y-5">
            {stats.recentProjects.length === 0 ? (
              <p className="text-slate-500 text-sm">No recent projects found.</p>
            ) : (
              stats.recentProjects.map((proj) => (
                <div key={proj._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                      {proj.imageUrl ? (
                        <img src={proj.imageUrl} alt={proj.title} className="w-full h-full object-cover" />
                      ) : (
                        <Briefcase size={18} className="text-slate-400" />
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-800 max-w-[150px] truncate">{proj.title}</p>
                  </div>
                  <span className="text-xs font-medium text-slate-400 shrink-0">{timeAgo(proj.createdAt)}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
      
    </div>
  );
};

export default DashboardHome;

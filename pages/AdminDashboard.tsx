import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DashboardStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, FileText, CheckSquare, Activity } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const data = await api.getStats();
      setStats(data);
    };
    fetchStats();
  }, []);

  // Mock data for charts
  const deptData = [
    { name: 'Public Works', value: 35 },
    { name: 'Water', value: 25 },
    { name: 'Electric', value: 20 },
    { name: 'Health', value: 10 },
    { name: 'Others', value: 10 },
  ];

  const statusData = [
    { name: 'Mon', submitted: 4, resolved: 2 },
    { name: 'Tue', submitted: 3, resolved: 4 },
    { name: 'Wed', submitted: 7, resolved: 5 },
    { name: 'Thu', submitted: 2, resolved: 3 },
    { name: 'Fri', submitted: 6, resolved: 6 },
    { name: 'Sat', submitted: 1, resolved: 0 },
    { name: 'Sun', submitted: 2, resolved: 1 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">System Overview</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Complaints</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.total || '-'}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.pending || '-'}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <CheckSquare size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Resolved</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.resolved || '-'}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Avg Resolution</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.avgResolutionTime || '-'}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[400px]">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Department Distribution</h2>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={deptData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {deptData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[400px]">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Weekly Trends</h2>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart
              data={statusData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f3f4f6' }} />
              <Legend />
              <Bar dataKey="submitted" fill="#1976d2" radius={[4, 4, 0, 0]} name="New Complaints" />
              <Bar dataKey="resolved" fill="#4caf50" radius={[4, 4, 0, 0]} name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="mt-8 bg-blue-900 text-white p-6 rounded-xl flex justify-between items-center">
        <div>
           <h3 className="font-bold text-lg">AI Model Performance</h3>
           <p className="text-blue-200">Current routing accuracy based on user feedback</p>
        </div>
        <div className="text-4xl font-bold text-green-400">92.4%</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
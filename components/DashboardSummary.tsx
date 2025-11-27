import React, { useMemo } from 'react';
import { Job } from '../types';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { AlertCircle, CheckCircle2, Clock, CalendarDays } from 'lucide-react';

interface DashboardSummaryProps {
  jobs: Job[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#EE2E24'];

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({ jobs }) => {
  
  const stats = useMemo(() => {
    const total = jobs.length;
    const completed = jobs.filter(j => j.status === 'Completed').length;
    const pending = jobs.filter(j => j.status === 'Pending').length;
    const inProgress = jobs.filter(j => j.status === 'In Progress').length;
    
    // Calculate Overdue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const overdueJobs = jobs.filter(j => {
      const deadline = new Date(j.deadline);
      return deadline < today && j.status !== 'Completed';
    });

    return { total, completed, pending, inProgress, overdue: overdueJobs.length, overdueList: overdueJobs };
  }, [jobs]);

  const pieData = [
    { name: 'Pending', value: stats.pending },
    { name: 'In Progress', value: stats.inProgress },
    { name: 'Completed', value: stats.completed },
    { name: 'Overdue', value: stats.overdue },
  ];

  // Group by Category
  const barData = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach(job => {
      counts[job.category] = (counts[job.category] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({
      name: key,
      count: counts[key]
    }));
  }, [jobs]);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Monitoring Pekerjaan</h1>
        <p className="text-gray-500 mt-1">Summary performa dan status pekerjaan terkini.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 rounded-full bg-blue-50 text-blue-600 mr-4">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Pekerjaan</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.total}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 rounded-full bg-green-50 text-green-600 mr-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Selesai</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.completed}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 rounded-full bg-yellow-50 text-yellow-600 mr-4">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Dalam Proses</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.inProgress + stats.pending}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 rounded-full bg-red-50 text-red-600 mr-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Melewati Dateline</p>
            <h3 className="text-2xl font-bold text-red-600">{stats.overdue}</h3>
          </div>
        </div>
      </div>

      {/* Overdue Alert Banner */}
      {stats.overdue > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start animate-pulse">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
          <div>
            <h4 className="text-red-800 font-semibold">Perhatian: {stats.overdue} Pekerjaan Melewati Dateline!</h4>
            <p className="text-red-700 text-sm mt-1">
              Segera tinjau menu pekerjaan terkait untuk melakukan tindak lanjut.
            </p>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[350px]">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribusi Status</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[350px]">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Volume Pekerjaan per Akun</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12}} />
                <Tooltip />
                <Bar dataKey="count" fill="#002F6C" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Recent Overdue Table */}
      {stats.overdueList.length > 0 && (
         <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-red-50">
              <h3 className="font-semibold text-red-800">Daftar Keterlambatan (Prioritas)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Cabang/Dept</th>
                    <th className="p-3">Jenis Pekerjaan</th>
                    <th className="p-3">Dateline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.overdueList.slice(0, 5).map(job => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="p-3">{job.category} - {job.subCategory}</td>
                      <td className="p-3 font-medium">{job.branchDept}</td>
                      <td className="p-3">{job.jobType}</td>
                      <td className="p-3 text-red-600 font-bold">{new Date(job.deadline).toLocaleDateString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
         </div>
      )}
    </div>
  );
};
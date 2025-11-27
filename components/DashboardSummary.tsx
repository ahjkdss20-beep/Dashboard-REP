
import React, { useMemo, useState, useRef } from 'react';
import { Job, Status } from '../types';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { AlertCircle, CheckCircle2, Clock, CalendarDays, Upload, FileDown, ArrowLeft, Search } from 'lucide-react';

interface DashboardSummaryProps {
  jobs: Job[];
  onBulkAddJobs: (jobs: Job[]) => void;
}

// COLORS: Pending(Blue), In Progress(Yellow/Orange), Completed(Green), Overdue(Red)
const COLORS = ['#0088FE', '#FFBB28', '#00C49F', '#EE2E24'];

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({ jobs, onBulkAddJobs }) => {
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Handle Global Upload
  const handleDownloadTemplate = () => {
    const headers = "Kategori,Sub Kategori,Tanggal Input (YYYY-MM-DD),Cabang/Dept,Jenis Pekerjaan,Status,Dateline (YYYY-MM-DD)";
    const exampleRow = "Penyesuaian,Harga Jual,2024-03-20,Jakarta,Update Tarif,Pending,2024-03-25";
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + exampleRow;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Template_Global_Upload.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r\n|\n/);
      const newJobs: Job[] = [];
      
      for(let i=1; i<lines.length; i++) {
        if(!lines[i] || !lines[i].trim()) continue;
        
        const cols = lines[i].split(/,|;/); 
        
        // Need at least 7 columns for global upload including category/subcategory
        if (cols.length >= 7 && cols[0] && cols[1]) {
            const rawStatus = cols[5]?.trim();
            let validStatus: Status = 'Pending';
            if (rawStatus === 'In Progress' || rawStatus === 'Completed' || rawStatus === 'Overdue') {
                validStatus = rawStatus as Status;
            }

            newJobs.push({
                id: crypto.randomUUID(),
                category: cols[0]?.trim(),
                subCategory: cols[1]?.trim(),
                dateInput: cols[2]?.trim() || new Date().toISOString().split('T')[0],
                branchDept: cols[3]?.trim() || 'Unknown',
                jobType: cols[4]?.trim() || 'Imported Job',
                status: validStatus,
                deadline: cols[6]?.trim() || new Date().toISOString().split('T')[0],
                // Activation date might be missing in global template, default to undefined
                activationDate: undefined 
            });
        }
      }
      
      if (newJobs.length > 0) {
          onBulkAddJobs(newJobs);
          alert(`Berhasil mengimport ${newJobs.length} data pekerjaan secara global!`);
      } else {
          alert("Gagal membaca file. Pastikan menggunakan Template Global yang sesuai.");
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  // Filter List Logic
  const filteredList = useMemo(() => {
    if (!filterStatus) return [];
    
    let result = jobs;

    // Filter by Status click
    if (filterStatus === 'Total') {
        result = jobs;
    } else if (filterStatus === 'Overdue') {
        const today = new Date();
        today.setHours(0,0,0,0);
        result = jobs.filter(j => new Date(j.deadline) < today && j.status !== 'Completed');
    } else if (filterStatus === 'In Progress') {
        // Gabungkan Pending dan In Progress jika klik "Dalam Proses" sesuai grouping di stat card
        result = jobs.filter(j => j.status === 'In Progress' || j.status === 'Pending');
    } else {
        result = jobs.filter(j => j.status === filterStatus);
    }

    // Filter by Search
    if (searchTerm) {
        result = result.filter(j => 
            j.branchDept.toLowerCase().includes(searchTerm.toLowerCase()) || 
            j.jobType.toLowerCase().includes(searchTerm.toLowerCase()) ||
            j.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    return result;
  }, [jobs, filterStatus, searchTerm]);

  const getStatusColor = (status: Status, deadline: string) => {
    const isOverdue = new Date() > new Date(deadline) && status !== 'Completed';
    if (isOverdue) return 'bg-red-100 text-red-800 border-red-200';
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200'; // Changed to Yellow
      default: return 'bg-blue-50 text-blue-800 border-blue-100'; // Pending is blueish
    }
  };

  // View: Detail Table
  if (filterStatus) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <button 
                        onClick={() => setFilterStatus(null)}
                        className="flex items-center text-gray-500 hover:text-[#EE2E24] mb-2 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Dashboard
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">
                        Detail Pekerjaan: <span className="text-[#002F6C]">{filterStatus === 'In Progress' ? 'Dalam Proses & Pending' : filterStatus}</span>
                    </h2>
                </div>
                
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Cari..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                            <tr>
                                <th className="p-4">Kategori / Sub</th>
                                <th className="p-4">Tanggal Input</th>
                                <th className="p-4">Cabang</th>
                                <th className="p-4">Pekerjaan</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Dateline</th>
                                <th className="p-4">Oleh</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredList.length === 0 ? (
                                <tr><td colSpan={7} className="p-8 text-center text-gray-400">Tidak ada data ditemukan.</td></tr>
                            ) : (
                                filteredList.map(job => (
                                    <tr key={job.id} className="hover:bg-gray-50">
                                        <td className="p-4">
                                            <div className="font-medium text-gray-800">{job.category}</div>
                                            <div className="text-xs text-gray-500">{job.subCategory}</div>
                                        </td>
                                        <td className="p-4">{new Date(job.dateInput).toLocaleDateString('id-ID')}</td>
                                        <td className="p-4">{job.branchDept}</td>
                                        <td className="p-4">{job.jobType}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(job.status, job.deadline)}`}>
                                                {job.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`font-medium ${new Date() > new Date(job.deadline) && job.status !== 'Completed' ? 'text-red-600' : 'text-gray-600'}`}>
                                                {new Date(job.deadline).toLocaleDateString('id-ID')}
                                            </span>
                                        </td>
                                        <td className="p-4 text-xs text-gray-400">
                                            {job.createdBy || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
  }

  // View: Main Dashboard
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Monitoring Pekerjaan</h1>
            <p className="text-gray-500 mt-1">Summary performa dan status pekerjaan terkini.</p>
        </div>
        <div className="flex gap-2">
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".csv,.txt" 
                onChange={handleFileUpload}
            />
            <button 
                onClick={handleDownloadTemplate}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
                <FileDown className="w-4 h-4 mr-2" /> Template Global
            </button>
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center px-4 py-2 bg-[#002F6C] text-white rounded-lg hover:bg-blue-900 transition-colors text-sm font-medium shadow-sm"
            >
                <Upload className="w-4 h-4 mr-2" /> Upload Data Keseluruhan
            </button>
        </div>
      </div>

      {/* Overdue Alert Banner (Highlight) */}
      {stats.overdue > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start animate-pulse shadow-sm">
          <AlertCircle className="w-6 h-6 text-red-600 mr-3 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-red-800 font-bold text-lg">PERHATIAN: {stats.overdue} Pekerjaan Melewati Dateline!</h4>
            <p className="text-red-700 mt-1">
              Mohon segera selesaikan pekerjaan yang tertunda. Klik pada kartu "Melewati Dateline" untuk melihat detail.
            </p>
          </div>
        </div>
      )}

      {/* Stat Cards - Clickable */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
            onClick={() => setFilterStatus('Total')}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center cursor-pointer hover:shadow-md transition-shadow group"
        >
          <div className="p-3 rounded-full bg-blue-50 text-blue-600 mr-4 group-hover:bg-blue-100 transition-colors">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Pekerjaan</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.total}</h3>
          </div>
        </div>

        <div 
            onClick={() => setFilterStatus('Completed')}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center cursor-pointer hover:shadow-md transition-shadow group"
        >
          <div className="p-3 rounded-full bg-green-50 text-green-600 mr-4 group-hover:bg-green-100 transition-colors">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Selesai</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.completed}</h3>
          </div>
        </div>

        <div 
            onClick={() => setFilterStatus('In Progress')}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center cursor-pointer hover:shadow-md transition-shadow group"
        >
          <div className="p-3 rounded-full bg-yellow-50 text-yellow-600 mr-4 group-hover:bg-yellow-100 transition-colors">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Dalam Proses</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.inProgress + stats.pending}</h3>
          </div>
        </div>

        <div 
            onClick={() => setFilterStatus('Overdue')}
            className="bg-white p-6 rounded-xl shadow-sm border border-red-100 flex items-center cursor-pointer hover:shadow-md transition-shadow group relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-16 h-16 bg-red-500 opacity-10 rounded-bl-full"></div>
          <div className="p-3 rounded-full bg-red-50 text-red-600 mr-4 group-hover:bg-red-100 transition-colors">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Melewati Dateline</p>
            <h3 className="text-2xl font-bold text-red-600">{stats.overdue}</h3>
          </div>
        </div>
      </div>

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
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Volume Pekerjaan per Kategori</h3>
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
            <div className="p-4 border-b border-gray-100 bg-red-50 flex justify-between items-center">
              <h3 className="font-semibold text-red-800">Daftar Keterlambatan (Prioritas)</h3>
              <button 
                onClick={() => setFilterStatus('Overdue')} 
                className="text-xs text-red-600 hover:text-red-800 underline"
              >
                Lihat Semua
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Cabang/Dept</th>
                    <th className="p-3">Jenis Pekerjaan</th>
                    <th className="p-3">Dateline</th>
                    <th className="p-3">Oleh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.overdueList.slice(0, 5).map(job => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="p-3">{job.category} - {job.subCategory}</td>
                      <td className="p-3 font-medium">{job.branchDept}</td>
                      <td className="p-3">{job.jobType}</td>
                      <td className="p-3 text-red-600 font-bold">{new Date(job.deadline).toLocaleDateString('id-ID')}</td>
                      <td className="p-3 text-xs text-gray-500">{job.createdBy || '-'}</td>
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

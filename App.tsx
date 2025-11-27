import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { DashboardSummary } from './components/DashboardSummary';
import { JobManager } from './components/JobManager';
import { Job } from './types';

function App() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null);
  
  // Data Persistence
  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem('jne_jobs_data');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('jne_jobs_data', JSON.stringify(jobs));
  }, [jobs]);

  const handleNavigate = (cat: string | null, sub: string | null) => {
    setActiveCategory(cat);
    setActiveSubCategory(sub);
  };

  const handleAddJob = (job: Job) => {
    setJobs(prev => [job, ...prev]);
  };

  const handleUpdateJob = (id: string, updates: Partial<Job>) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, ...updates } : j));
  };

  const handleDeleteJob = (id: string) => {
    if (confirm("Apakah anda yakin ingin menghapus data ini?")) {
      setJobs(prev => prev.filter(j => j.id !== id));
    }
  };

  const handleBulkAdd = (newJobs: Job[]) => {
    setJobs(prev => [...newJobs, ...prev]);
  };

  return (
    <Layout 
      activeCategory={activeCategory} 
      activeSubCategory={activeSubCategory} 
      onNavigate={handleNavigate}
    >
      {/* Dynamic Content based on selection */}
      {!activeCategory ? (
        <DashboardSummary jobs={jobs} />
      ) : (
        activeSubCategory && (
          <JobManager 
            category={activeCategory}
            subCategory={activeSubCategory}
            jobs={jobs}
            onAddJob={handleAddJob}
            onUpdateJob={handleUpdateJob}
            onDeleteJob={handleDeleteJob}
            onBulkAddJobs={handleBulkAdd}
          />
        )
      )}
    </Layout>
  );
}

export default App;
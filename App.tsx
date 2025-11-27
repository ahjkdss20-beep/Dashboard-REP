
import { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { DashboardSummary } from './components/DashboardSummary';
import { JobManager } from './components/JobManager';
import { Login } from './components/Login';
import { Job, User } from './types';
import { AUTHORIZED_USERS } from './constants';

function App() {
  // Load Users from LocalStorage or initialize with constants
  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem('jne_users_data');
    return savedUsers ? JSON.parse(savedUsers) : AUTHORIZED_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('jne_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null);
  
  // Data Persistence for Jobs
  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem('jne_jobs_data');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('jne_jobs_data', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('jne_users_data', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('jne_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('jne_current_user');
    }
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveCategory(null);
    setActiveSubCategory(null);
  };

  const handleChangePassword = (oldPass: string, newPass: string) => {
    if (!currentUser) return false;
    
    // Verify old password
    if (currentUser.password !== oldPass) {
        return false;
    }

    // Update user in state and list
    const updatedUser = { ...currentUser, password: newPass };
    const updatedUserList = users.map(u => u.email === currentUser.email ? updatedUser : u);
    
    setUsers(updatedUserList);
    setCurrentUser(updatedUser);
    return true;
  };

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

  // Logic: Admin sees ALL. Users see CreatedBy == TheirEmail OR jobs with no creator (legacy data).
  const visibleJobs = useMemo(() => {
    if (!currentUser) return [];
    
    if (currentUser.role === 'Admin') {
        return jobs;
    }

    return jobs.filter(job => 
        job.createdBy === currentUser.email || !job.createdBy
    );
  }, [jobs, currentUser]);

  if (!currentUser) {
    return <Login onLogin={handleLogin} users={users} />;
  }

  return (
    <Layout 
      activeCategory={activeCategory} 
      activeSubCategory={activeSubCategory} 
      onNavigate={handleNavigate}
      user={currentUser}
      onLogout={handleLogout}
      onChangePassword={handleChangePassword}
    >
      {/* Dynamic Content based on selection */}
      {!activeCategory ? (
        <DashboardSummary jobs={visibleJobs} onBulkAddJobs={handleBulkAdd} />
      ) : (
        activeSubCategory && (
          <JobManager 
            category={activeCategory}
            subCategory={activeSubCategory}
            jobs={visibleJobs}
            onAddJob={handleAddJob}
            onUpdateJob={handleUpdateJob}
            onDeleteJob={handleDeleteJob}
            onBulkAddJobs={handleBulkAdd}
            currentUser={currentUser}
          />
        )
      )}
    </Layout>
  );
}

export default App;

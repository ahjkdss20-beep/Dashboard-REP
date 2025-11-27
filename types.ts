
export type Status = 'Pending' | 'In Progress' | 'Completed' | 'Overdue';

export interface Job {
  id: string;
  category: string;
  subCategory: string;
  dateInput: string;
  branchDept: string;
  jobType: string; // "Jenis Pekerjaan"
  status: Status;
  deadline: string; // "Dateline"
  activationDate?: string; // Only for "Produksi Master Data"
  notes?: string;
  createdBy?: string; // Email of the user who created the job
}

export interface MenuItem {
  name: string;
  submenus: string[];
}

export interface MenuStructure {
  [key: string]: MenuItem;
}

export type ViewMode = 'dashboard' | 'category';

export type UserRole = 'Admin' | 'User';

export interface User {
  email: string;
  name: string;
  role: UserRole;
  password?: string; // Added password field
}

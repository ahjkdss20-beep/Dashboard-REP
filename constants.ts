
import { MenuStructure, User } from './types';

export const MENU_STRUCTURE: MenuStructure = {
  "Penyesuaian": {
    name: "Penyesuaian",
    submenus: ["Harga Jual", "Routing", "Costing"]
  },
  "Request Data": {
    name: "Request Data",
    submenus: ["KCU", "Nasional", "Project"]
  },
  "Problem": {
    name: "Problem",
    submenus: ["Tarif", "SLA", "Biaya", "Routing"]
  },
  "Produksi Master Data": {
    name: "Produksi Master Data",
    submenus: ["Cabang", "Nasional"]
  }
};

export const JNE_RED = "#EE2E24";
export const JNE_BLUE = "#002F6C";

// Fallback logo if the direct drive link has issues
export const LOGO_URL = "https://lh3.googleusercontent.com/d/19L5QBkcuSDrfWX_uqZGVUkpAlriZijp1";

// Default users with initial password
export const AUTHORIZED_USERS: User[] = [
  { email: "Ahmad.fauzan@jne.co.id", name: "Ahmad Fauzan", role: "Admin", password: "000000" },
  { email: "agus.permana@jne.co.id", name: "Agus Permana", role: "User", password: "000000" },
  { email: "rita.sumardi@jne.co.id", name: "Rita Sumardi", role: "User", password: "000000" },
  { email: "adm.ppdd@jne.co.id", name: "Admin PPDD", role: "User", password: "000000" },
  { email: "davis.gunawan@jne.co.id", name: "Davis Gunawan", role: "User", password: "000000" }
];

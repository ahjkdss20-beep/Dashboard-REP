import { MenuStructure } from './types';

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

// Fallback logo if the direct drive link has issues, but trying to use a proxy accessible one
export const LOGO_URL = "https://lh3.googleusercontent.com/d/19L5QBkcuSDrfWX_uqZGVUkpAlriZijp1"; 

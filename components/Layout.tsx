import React, { useState } from 'react';
import { Menu, ChevronDown, ChevronRight, LayoutDashboard, Briefcase } from 'lucide-react';
import { MENU_STRUCTURE, LOGO_URL } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeCategory: string | null;
  activeSubCategory: string | null;
  onNavigate: (category: string | null, subCategory: string | null) => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeCategory, 
  activeSubCategory, 
  onNavigate 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    "Penyesuaian": true,
    "Request Data": false,
    "Problem": false,
    "Produksi Master Data": false
  });

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const handleNavClick = (cat: string | null, sub: string | null) => {
    onNavigate(cat, sub);
    // On mobile, close sidebar after selection
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="h-20 flex items-center justify-center border-b border-gray-100 p-4">
            <img 
              src={LOGO_URL} 
              alt="JNE Logo" 
              className="h-12 object-contain"
              onError={(e) => {
                // Fallback text if image fails
                (e.target as HTMLImageElement).style.display = 'none';
                ((e.target as HTMLImageElement).nextSibling as HTMLElement).style.display = 'block';
              }}
            />
            <span className="text-2xl font-bold text-[#EE2E24] hidden">JNE</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
            <button
              onClick={() => handleNavClick(null, null)}
              className={`flex items-center w-full px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeCategory === null 
                  ? 'bg-red-50 text-[#EE2E24]' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 mr-3" />
              Summary Dashboard
            </button>

            <div className="pt-4 pb-2">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Menu Akun Pekerjaan
              </p>
            </div>

            {Object.values(MENU_STRUCTURE).map((menu) => (
              <div key={menu.name} className="mb-1">
                <button
                  onClick={() => toggleMenu(menu.name)}
                  className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <Briefcase className="w-5 h-5 mr-3 text-gray-400" />
                    {menu.name}
                  </div>
                  {expandedMenus[menu.name] ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {expandedMenus[menu.name] && (
                  <div className="mt-1 ml-4 space-y-1 border-l-2 border-gray-100 pl-2">
                    {menu.submenus.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => handleNavClick(menu.name, sub)}
                        className={`flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors ${
                          activeCategory === menu.name && activeSubCategory === sub
                            ? 'bg-red-50 text-[#EE2E24] font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 opacity-50"></span>
                        {sub}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Footer User Info */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center p-2 rounded-lg bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-[#002F6C] flex items-center justify-center text-white font-bold text-xs">
                AD
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">Admin User</p>
                <p className="text-xs text-gray-500">Divisi Operasional</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white h-16 border-b border-gray-200 flex items-center justify-between px-4 z-10">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <img src={LOGO_URL} alt="JNE" className="h-8 ml-3" />
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
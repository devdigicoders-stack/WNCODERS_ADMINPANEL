import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  FolderKanban, 
  Users, 
  FileText, 
  Mail, 
  Settings,
  Search,
  Bell,
  Menu,
  X,
  LogOut
} from 'lucide-react';

const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    navigate('/');
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/dashboard': return 'Dashboard';
      case '/dashboard/enquiries': return 'Enquiries';
      case '/dashboard/projects': return 'Projects';
      case '/dashboard/team-members': return 'Team Members';
      case '/dashboard/blog': return 'Blog';
      case '/dashboard/categories': return 'Categories';
      case '/dashboard/contact-us': return 'Contact Us';
      case '/dashboard/settings': return 'Settings';
      default: return 'Dashboard';
    }
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center ${isCollapsed ? 'lg:justify-center lg:px-0 px-4' : 'gap-3 px-4'} py-3 rounded-xl font-medium transition-all duration-200 ${
      isActive
        ? 'bg-[#0ca356] text-white'
        : 'text-slate-300 hover:bg-white/5 hover:text-white'
    }`;

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans overflow-hidden">
      
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static top-0 left-0 h-full bg-[#0a111a] text-slate-300 flex flex-col shrink-0 transition-all duration-300 z-30
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
        ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className={`p-6 flex items-center justify-between lg:justify-start ${isCollapsed ? 'lg:px-0 lg:justify-center' : 'gap-3'} h-[88px] shrink-0 transition-all duration-300`}>
          <div className="flex items-center gap-3">
            <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
              <path d="M15 25L35 75L55 25" stroke="#f8fafc" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M45 75L65 25L85 75" stroke="#0CA356" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className={`text-xl font-bold text-white tracking-tight whitespace-nowrap overflow-hidden ${isCollapsed ? 'lg:hidden' : 'block'}`}>WNCoders</span>
          </div>
          <button onClick={() => setIsMobileOpen(false)} className="text-slate-400 hover:text-white lg:hidden">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto overflow-x-hidden">
          <NavLink to="/dashboard" end title="Dashboard" className={navLinkClass}>
            <LayoutDashboard size={20} className="shrink-0" />
            <span className={`whitespace-nowrap ${isCollapsed ? 'lg:hidden' : 'block'}`}>Dashboard</span>
          </NavLink>
          <NavLink to="/dashboard/enquiries" title="Enquiries" className={navLinkClass}>
            <MessageSquare size={20} className="shrink-0" />
            <span className={`whitespace-nowrap ${isCollapsed ? 'lg:hidden' : 'block'}`}>Enquiries</span>
          </NavLink>
          <NavLink to="/dashboard/projects" title="Projects" className={navLinkClass}>
            <FolderKanban size={20} className="shrink-0" />
            <span className={`whitespace-nowrap ${isCollapsed ? 'lg:hidden' : 'block'}`}>Projects</span>
          </NavLink>
          <NavLink to="/dashboard/team-members" title="Team Members" className={navLinkClass}>
            <Users size={20} className="shrink-0" />
            <span className={`whitespace-nowrap ${isCollapsed ? 'lg:hidden' : 'block'}`}>Team Members</span>
          </NavLink>
          <NavLink to="/dashboard/categories" title="Categories" className={navLinkClass}>
            <FileText size={20} className="shrink-0" />
            <span className={`whitespace-nowrap ${isCollapsed ? 'lg:hidden' : 'block'}`}>Categories</span>
          </NavLink>
          <NavLink to="/dashboard/blog" title="Blog" className={navLinkClass}>
            <FileText size={20} className="shrink-0" />
            <span className={`whitespace-nowrap ${isCollapsed ? 'lg:hidden' : 'block'}`}>Blog</span>
          </NavLink>
          <NavLink to="/dashboard/contact-us" title="Contact Us" className={navLinkClass}>
            <Mail size={20} className="shrink-0" />
            <span className={`whitespace-nowrap ${isCollapsed ? 'lg:hidden' : 'block'}`}>Contact Us</span>
          </NavLink>
          
          <NavLink to="/dashboard/settings" title="Settings" className={navLinkClass}>
            <Settings size={20} className="shrink-0" />
            <span className={`whitespace-nowrap ${isCollapsed ? 'lg:hidden' : 'block'}`}>Settings</span>
          </NavLink>
          
        </nav>

        <div className="p-4 mt-auto border-t border-white/5">
          <button 
            onClick={handleLogout}
            title="Log Out" 
            className={`w-full flex items-center ${isCollapsed ? 'lg:justify-center lg:px-0 px-4' : 'gap-3 px-4'} py-3 rounded-xl font-medium transition-all duration-200 text-red-400 hover:bg-red-500/10 hover:text-red-500`}
          >
            <LogOut size={20} className="shrink-0" />
            <span className={`whitespace-nowrap ${isCollapsed ? 'lg:hidden' : 'block'}`}>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        
        {/* Header */}
        <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-5 bg-white border-b border-slate-100 sticky top-0 z-10 min-h-[88px]">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => setIsMobileOpen(true)} 
              className="p-2 text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors lg:hidden"
            >
              <Menu size={20} />
            </button>
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)} 
              className="p-2 text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors hidden lg:block"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 truncate">{getPageTitle(location.pathname)}</h1>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <img src="https://i.pravatar.cc/150?img=11" alt="Admin" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover shadow-sm" />
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-slate-700">Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content (Outlet) */}
        <div className="flex-1 overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

import { Outlet, NavLink } from 'react-router-dom';
import { UploadCloud, ListVideo, Download, LayoutDashboard } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { cn } from '../utils/helpers';

const Sidebar = () => {
  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/upload', icon: UploadCloud, label: 'Upload' },
    { to: '/processing', icon: ListVideo, label: 'Processing' },
    { to: '/downloads', icon: Download, label: 'Downloads' },
  ];

  return (
    <aside className="w-64 bg-zinc-950 text-slate-300 hidden md:flex flex-col h-screen fixed">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="bg-indigo-500 rounded p-1">
            <ListVideo size={24} className="text-white" />
          </span>
          AudioVid
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-indigo-600/10 text-indigo-400 font-medium'
                  : 'hover:bg-zinc-900 hover:text-white'
              )
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 text-xs text-slate-500">
        &copy; 2026 AudioVid Maker
      </div>
    </aside>
  );
};

const Navbar = () => {
  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 md:hidden">
      <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
        <span className="bg-indigo-500 rounded p-1">
          <ListVideo size={20} className="text-white" />
        </span>
        AudioVid
      </h1>
      {/* Mobile menu button could go here */}
    </header>
  );
};

import { Moon, Sun } from 'lucide-react';

export const MainLayout = ({ darkMode, setDarkMode }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-900 transition-colors duration-200 flex text-slate-900 dark:text-white">
      <Toaster position="top-right" />
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 md:p-8 relative">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="absolute top-6 right-8 p-2 rounded-full bg-white dark:bg-zinc-800 text-slate-500 dark:text-zinc-300 shadow-sm border border-slate-200 dark:border-zinc-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors z-10"
            title="Toggle Dark Mode"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

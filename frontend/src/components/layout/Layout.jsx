import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const studentNav = [
  { path: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { path: '/documents', icon: '📂', label: 'My Documents' },
  { path: '/upload',    icon: '⬆', label: 'Upload PDF' },
  { path: '/chat',      icon: '💬', label: 'AI Chat' },
  { path: '/quiz',      icon: '🧠', label: 'Quiz' },
  { path: '/flashcards',icon: '🗂', label: 'Flashcards' },
];
const adminNav = [
  { path: '/admin',           icon: '⊞', label: 'Admin Dashboard' },
  { path: '/admin/users',     icon: '👥', label: 'Manage Users' },
  { path: '/admin/documents', icon: '📂', label: 'All Documents' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navItems = user?.role === 'admin' ? adminNav : studentNav;
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/login'); };

  const Sidebar = () => (
    <aside className="flex flex-col h-full w-64 fixed left-0 top-0 z-40"
      style={{ background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 60%, #3730a3 100%)' }}>
      <div className="p-5 border-b border-indigo-700/50">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-lg ${isAdmin ? 'bg-orange-500' : 'bg-white/20 backdrop-blur'}`}>
            {isAdmin ? '👑' : 'AI'}
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">{isAdmin ? 'Admin Panel' : 'Study Assistant'}</h1>
            <p className="text-xs text-indigo-300">{isAdmin ? 'Platform Management' : 'Powered by AI'}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto">
        <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest px-3 mb-3 mt-1">
          {isAdmin ? 'Admin Menu' : 'Navigation'}
        </p>
        {navItems.map(item => {
          const active = location.pathname === item.path ||
            (item.path !== '/admin' && location.pathname.startsWith(item.path + '/'));
          return (
            <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-all duration-200 ${
                active ? 'bg-white text-indigo-700 shadow-lg shadow-indigo-900/30 font-semibold'
                       : 'text-indigo-200 hover:bg-white/10 hover:text-white'}`}>
              <span className="text-base">{item.icon}</span>{item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-indigo-700/50">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/10 backdrop-blur">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow ${isAdmin ? 'bg-orange-500' : 'bg-indigo-400'}`}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-indigo-300 truncate">{isAdmin ? '👑 Administrator' : 'Student'}</p>
          </div>
          <button onClick={handleLogout} title="Logout" className="text-indigo-300 hover:text-red-400 transition-colors text-sm">↪</button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen" style={{ background: '#f8faff' }}>
      <div className="hidden lg:block"><Sidebar /></div>
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-indigo-950/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <Sidebar />
        </div>
      )}
      <div className="lg:pl-64">
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-600 hover:text-indigo-600 text-xl">☰</button>
          <span className="text-sm font-bold text-slate-800">{isAdmin ? '👑 Admin Panel' : 'AI Study Assistant'}</span>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${isAdmin ? 'bg-orange-500' : 'bg-indigo-500'}`}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
        </div>
        <main className="p-4 lg:p-8 min-h-screen animate-fade-in">{children}</main>
      </div>
    </div>
  );
}

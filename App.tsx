import React, { useState } from 'react';
import { User } from './types';
import LandingPage from './pages/LandingPage';
import CitizenDashboard from './pages/CitizenDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { LayoutDashboard, LogOut, Bell, User as UserIcon } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  const handleAuthSuccess = (loggedUser: User) => {
    setUser(loggedUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <LandingPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar / Mobile Nav */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col md:h-screen sticky top-0 z-10">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-2 text-primary font-bold text-xl">
            <div className="w-8 h-8 bg-primary text-white rounded flex items-center justify-center text-sm">SG</div>
            Smart Griev
          </div>
          <button className="md:hidden text-gray-500">
             {/* Mobile Menu Icon could go here */}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Menu
          </div>
          <nav className="space-y-1 px-2">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg bg-blue-50 text-primary">
              <LayoutDashboard size={18} />
              Dashboard
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              <Bell size={18} />
              Notifications
              <span className="ml-auto bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">3</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              <UserIcon size={18} />
              Profile
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate capitalize">{user.role.toLowerCase()}</p>
              </div>
           </div>
           <button 
             onClick={handleLogout}
             className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
           >
             <LogOut size={16} />
             Sign Out
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto h-[calc(100vh-64px)] md:h-screen">
        {/* Render Dashboard based on role */}
        {user.role === 'CITIZEN' && <CitizenDashboard user={user} />}
        {user.role === 'OFFICER' && <OfficerDashboard user={user} />}
        {user.role === 'ADMIN' && <AdminDashboard />}
      </main>
    </div>
  );
};

export default App;
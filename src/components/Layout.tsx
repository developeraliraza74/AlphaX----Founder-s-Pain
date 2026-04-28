import React from 'react';
import { 
  LayoutDashboard, 
  RefreshCcw, 
  CheckSquare, 
  Zap, 
  LogOut,
  ChevronRight,
  User as UserIcon
} from 'lucide-react';
import { User } from 'firebase/auth';
import { logout } from '../lib/firebase';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'syncs' | 'tasks' | 'intelligence';
  setActiveTab: (tab: 'dashboard' | 'syncs' | 'tasks' | 'intelligence') => void;
  user: User;
}

export function Layout({ children, activeTab, setActiveTab, user }: LayoutProps) {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'syncs', label: 'Context Sync', icon: RefreshCcw },
    { id: 'tasks', label: 'Action Items', icon: CheckSquare },
    { id: 'intelligence', label: 'AI Intel', icon: Zap },
  ] as const;

  return (
    <div className="flex h-screen bg-[#F5F2ED] text-[#141414] font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r-1 border-gray-200 flex flex-col shadow-sm">
        <div className="p-8">
          <div className="flex items-center space-x-3 mb-10">
            <div className="w-10 h-10 bg-[#141414] rounded-lg flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-medium tracking-tight">Stack</span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center px-4 py-3 rounded-xl transition-all font-medium text-sm border-1 border-transparent",
                  activeTab === item.id 
                    ? "bg-[#141414] text-white shadow-md" 
                    : "text-gray-500 hover:bg-gray-100"
                )}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
                {activeTab === item.id && (
                  <motion.div layoutId="arrow" className="ml-auto">
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 space-y-6">
          <div className="flex items-center p-4 bg-gray-50 rounded-2xl border-1 border-gray-100">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || ''} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
            ) : (
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                <UserIcon className="w-5 h-5 text-gray-500" />
              </div>
            )}
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium truncate">{user.displayName || 'Founder'}</p>
              <p className="text-xs text-gray-400 truncate uppercase tracking-widest font-semibold mt-0.5">Founder</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all text-sm font-medium"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative">
        <div className="max-w-6xl mx-auto p-12">
          {children}
        </div>
      </main>
    </div>
  );
}

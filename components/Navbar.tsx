
import React from 'react';
import { Shield, LayoutDashboard, PlusCircle, ShieldCheck, User as UserIcon, LogOut, Lock } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentView: string;
  setView: (view: string) => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView, user, onLogin, onLogout }) => {
  const isRecentlyVerified = user?.lastVerifiedAt && (Date.now() - user.lastVerifiedAt < 300000);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center cursor-pointer" onClick={() => setView('dashboard')}>
            <Shield className="h-8 w-8 text-indigo-600 mr-2" />
            <span className="text-xl font-bold text-slate-900 tracking-tight">ScamWatch</span>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => setView('dashboard')}
              className={`flex items-center px-3 py-2 text-sm font-bold transition-colors ${currentView === 'dashboard' ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}
            >
              <LayoutDashboard className="h-4 w-4 mr-1.5" />
              Database
            </button>
            <button 
              onClick={() => setView('submit')}
              className={`flex items-center px-3 py-2 text-sm font-bold transition-colors ${currentView === 'submit' ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}
            >
              <PlusCircle className="h-4 w-4 mr-1.5" />
              Report Scam
            </button>
            {user && user.role !== 'user' && (
              <button 
                onClick={() => setView('moderation')}
                className={`flex items-center px-3 py-2 text-sm font-bold transition-colors ${currentView === 'moderation' ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}
              >
                <ShieldCheck className="h-4 w-4 mr-1.5" />
                Moderation
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-900">{user.name}</span>
                    {isRecentlyVerified && (
                      <div title="2-Step Verified Session" className="bg-green-100 p-0.5 rounded-full">
                        <Lock className="h-2.5 w-2.5 text-green-600" />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user.role}</span>
                </div>
                <div className="relative group">
                  <div className="h-10 w-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-bold border-2 border-transparent group-hover:border-indigo-200 transition-all cursor-pointer">
                    <UserIcon className="h-5 w-5" />
                  </div>
                  {/* Dropdown simulation */}
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2">
                    <button 
                      onClick={onLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={onLogin}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ReportCard from './components/ReportCard';
import ReportForm from './components/ReportForm';
import ReportDetail from './components/ReportDetail';
import AuthModal from './components/AuthModal';
import { ScamReport, UserRole, ReportStatus, User } from './types';
import { INITIAL_REPORTS } from './constants';
import { Search, Filter, ShieldCheck, HelpCircle, Lock, Users, Edit3, Trash } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<string>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<ScamReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<ScamReport | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState<'login' | 'verify'>('login');
  const [pendingAction, setPendingAction] = useState<{ type: string, payload?: any } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('sotorko_reports');
    if (saved) {
      setReports(JSON.parse(saved));
    } else {
      setReports(INITIAL_REPORTS as ScamReport[]);
    }

    const savedUser = localStorage.getItem('sotorko_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const savedUsers = localStorage.getItem('sotorko_all_users');
    if (savedUsers) {
      setAllUsers(JSON.parse(savedUsers));
    } else {
      const defaultUsers: User[] = [
        { id: '1', email: 'admin@sotorko.com', name: 'Super Admin', role: 'admin', reputation: 100, isLoggedIn: false },
        { id: '2', email: 'mod@sotorko.com', name: 'Head Moderator', role: 'moderator', reputation: 50, isLoggedIn: false }
      ];
      setAllUsers(defaultUsers);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sotorko_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('sotorko_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('sotorko_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sotorko_user');
    }
  }, [user]);

  const handleLoginSuccess = (email: string) => {
    const name = email.split('@')[0];
    let existingUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!existingUser) {
        let role: UserRole = 'user';
        if (email.toLowerCase() === 'admin@sotorko.com') role = 'admin';
        else if (email.toLowerCase() === 'mod@sotorko.com') role = 'moderator';

        existingUser = {
            id: Math.random().toString(36).substr(2, 9),
            email,
            name: name.charAt(0).toUpperCase() + name.slice(1),
            role,
            reputation: 10,
            isLoggedIn: true,
            lastVerifiedAt: Date.now()
        };
        setAllUsers(prev => [...prev, existingUser!]);
    } else {
        existingUser = { ...existingUser, isLoggedIn: true, lastVerifiedAt: Date.now() };
        setAllUsers(prev => prev.map(u => u.id === existingUser!.id ? existingUser! : u));
    }

    setUser(existingUser);
    if (pendingAction) executePendingAction(existingUser);
  };

  const handleVerificationSuccess = () => {
    if (user) {
      const updatedUser = { ...user, lastVerifiedAt: Date.now() };
      setUser(updatedUser);
      setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      if (pendingAction) executePendingAction(updatedUser);
    }
  };

  const executePendingAction = (currentUser: User) => {
    if (!pendingAction) return;
    const { type, payload } = pendingAction;
    setPendingAction(null);

    if (type === 'submit_report') {
      handleCreateReport(payload, currentUser);
    } else if (type === 'comment') {
      handleAction(payload.reportId, 'comment', payload.data, currentUser);
    }
  };

  const requestSecuredAction = (type: string, payload: any) => {
    // Immediate actions for anyone (Anonymous included)
    if (type === 'vote' || type === 'flag') {
        handleAction(payload.reportId, type);
        return;
    }

    // Actions that REQUIRE login (like commenting)
    setPendingAction({ type, payload });
    if (!user) {
      setAuthType('login');
      setIsAuthModalOpen(true);
      return;
    }

    const isRecentlyVerified = user.lastVerifiedAt && (Date.now() - user.lastVerifiedAt < 300000);
    if (!isRecentlyVerified) {
      setAuthType('verify');
      setIsAuthModalOpen(true);
    } else {
      executePendingAction(user);
    }
  };

  const handleCreateReport = (data: Partial<ScamReport>, currentUser: User) => {
    setIsSubmitting(true);
    const newReport: ScamReport = {
      id: Math.random().toString(36).substr(2, 9),
      title: data.title || 'Untitled',
      scammerName: data.scammerName,
      scammerContact: data.scammerContact,
      whatsappNumber: data.whatsappNumber,
      reporterEmail: data.reporterEmail,
      platform: data.platform || 'Other',
      category: data.category || 'Other',
      description: data.description || '',
      proofUrls: data.proofUrls || [],
      status: 'pending',
      riskLevel: data.riskLevel || 'medium',
      upvotes: 0,
      flags: 0,
      reporterId: currentUser.id,
      createdAt: Date.now(),
      comments: [],
      aiSummary: data.aiSummary,
    };

    setTimeout(() => {
      setReports([newReport, ...reports]);
      setIsSubmitting(false);
      setView('dashboard');
    }, 1500);
  };

  const handleAction = (reportId: string, action: string, payload?: any, currentUser?: User) => {
    const activeUser = currentUser || user;

    setReports(prev => {
      const updatedReports = prev.map(r => {
        if (r.id !== reportId) return r;
        
        let updated = { ...r };
        switch (action) {
          case 'approve': updated.status = 'approved' as ReportStatus; break;
          case 'reject': updated.status = 'rejected' as ReportStatus; break;
          case 'vote': updated.upvotes += 1; break;
          case 'flag': updated.flags += 1; break;
          case 'comment': 
            if (!activeUser) return r;
            const newComment = {
              id: Date.now().toString(),
              userId: activeUser.id,
              userName: activeUser.name,
              text: payload.text,
              timestamp: Date.now(),
            };
            updated.comments = [...r.comments, newComment];
            break;
        }
        return updated;
      }).filter(r => !(r.id === reportId && action === 'delete'));

      // Critical Sync: Directly find the newly updated report to refresh the modal view
      const freshReport = updatedReports.find(r => r.id === reportId);
      if (selectedReport && selectedReport.id === reportId) {
        if (action === 'delete') {
            setSelectedReport(null);
        } else if (freshReport) {
            setSelectedReport(freshReport);
        }
      }

      return updatedReports;
    });
  };

  const handleUpdateUser = (updatedUser: User) => {
    setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (user?.id === updatedUser.id) setUser(updatedUser);
  };

  const logout = () => {
    if (user) {
        setAllUsers(prev => prev.map(u => u.id === user.id ? { ...u, isLoggedIn: false } : u));
    }
    setUser(null);
    setView('dashboard');
  };

  const filteredReports = reports.filter(r => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = r.title.toLowerCase().includes(query) || 
                         (r.scammerName && r.scammerName.toLowerCase().includes(query)) ||
                         (r.scammerContact && r.scammerContact.toLowerCase().includes(query)) ||
                         (r.whatsappNumber && r.whatsappNumber.toLowerCase().includes(query));
    
    const matchesCategory = categoryFilter === 'All' || r.category === categoryFilter;
    const isPublic = r.status === 'approved' || (user && user.role !== 'user');
    return matchesSearch && matchesCategory && isPublic;
  });

  const pendingCount = reports.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar 
        currentView={view} 
        setView={setView} 
        user={user}
        onLogin={() => { setAuthType('login'); setIsAuthModalOpen(true); }}
        onLogout={logout}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {view === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Public Safety Database</h1>
                <p className="text-slate-500 font-medium">Search for scammers by name, handle, or WhatsApp number.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type="text"
                    placeholder="Name, Phone, ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all w-full sm:w-64"
                  />
                </div>
              </div>
            </div>

            {user && user.role === 'admin' && (
                <div className="flex gap-4 mb-4">
                    <button 
                        onClick={() => setView('admin_users')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${view === 'admin_users' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
                    >
                        <Users className="h-4 w-4" />
                        Manage Users
                    </button>
                </div>
            )}

            {user && user.role !== 'user' && pendingCount > 0 && (
              <div 
                onClick={() => setView('moderation')}
                className="bg-indigo-600 rounded-2xl p-6 text-white flex items-center justify-between cursor-pointer hover:bg-indigo-700 transition-colors shadow-xl shadow-indigo-100 mb-8"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-xl"><ShieldCheck className="h-6 w-6" /></div>
                  <div>
                    <h3 className="text-lg font-bold">Review Needed: {pendingCount} Pending Submissions</h3>
                    <p className="text-indigo-100 text-sm">Action required to update the public database.</p>
                  </div>
                </div>
                <button className="bg-white text-indigo-600 px-6 py-2.5 rounded-xl font-black text-sm uppercase tracking-wider">Open Queue</button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.length > 0 ? (
                filteredReports.map(report => (
                  <ReportCard 
                    key={report.id} 
                    report={report} 
                    onClick={setSelectedReport} 
                  />
                ))
              ) : (
                <div className="col-span-full py-20 text-center">
                  <div className="bg-slate-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6"><HelpCircle className="h-10 w-10 text-slate-400" /></div>
                  <h3 className="text-xl font-bold text-slate-900">No matching records</h3>
                  <p className="text-slate-500">The scammer may not be reported yet. Be the first to warn others!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'submit' && <ReportForm onSubmit={(data) => requestSecuredAction('submit_report', data)} isSubmitting={isSubmitting} />}

        {view === 'admin_users' && (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">User Directory</h1>
                    <p className="text-slate-500 font-medium">Administrator view for managing community roles and data.</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">User</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Role</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {allUsers.map(u => (
                                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">{u.name[0]}</div>
                                            <div>
                                                <span className="text-sm font-bold text-slate-900 block">{u.name}</span>
                                                <span className="text-xs text-slate-400">{u.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${u.role === 'admin' ? 'bg-red-100 text-red-700' : (u.role === 'moderator' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600')}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => {
                                                    const newName = prompt("Enter new name for " + u.name, u.name);
                                                    if (newName) handleUpdateUser({ ...u, name: newName });
                                                }}
                                                className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors"
                                            ><Edit3 className="h-4 w-4" /></button>
                                            <button className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"><Trash className="h-4 w-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <button onClick={() => setView('dashboard')} className="text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors">Back to Dashboard</button>
            </div>
        )}

        {view === 'moderation' && (
          <div className="space-y-8">
             <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Moderation Queue</h1>
                <p className="text-slate-500 font-medium">Verify submissions to ensure data quality and trust.</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Report</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reports.filter(r => r.status === 'pending').map(report => (
                      <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-slate-900 block">{report.title}</span>
                          <span className="text-[10px] text-slate-400 font-medium uppercase">Platform: {report.platform}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => setSelectedReport(report)} className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-all">Review Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          </div>
        )}
      </main>

      {selectedReport && (
        <ReportDetail 
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          userRole={user?.role || 'user'}
          onAction={(id, action, payload) => {
            if (action === 'comment' || action === 'vote' || action === 'flag') {
              requestSecuredAction(action, { reportId: id, data: payload });
            } else {
              handleAction(id, action, payload);
            }
          }}
        />
      )}

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => { setIsAuthModalOpen(false); setPendingAction(null); }}
        onSuccess={handleLoginSuccess}
        type={authType}
        targetAction={pendingAction?.type.replace('_', ' ')}
      />

      <footer className="bg-slate-900 text-slate-400 py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 text-white font-black text-xl">
             <Shield className="h-6 w-6 text-indigo-500" /> SOTORKO.com
          </div>
          <p className="text-xs">© 2024 SOTORKO Global Security. Protecting the public from digital fraud.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;

function Shield(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  );
}

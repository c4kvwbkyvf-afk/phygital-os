import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import Orders from './components/Orders.tsx';
import Stock from './components/Stock.tsx';
import Logistics from './components/Logistics.tsx';
import Settings from './components/Settings.tsx';
import Accounting from './components/Accounting.tsx';
import Finance from './components/Finance.tsx';
import HR from './components/HR.tsx';
import Marketing from './components/Marketing.tsx';
import Auth from './components/Auth.tsx';
import { ViewMode, Language, User, AppNotification } from './types.ts';
import { isRTL } from './services/languageService.ts';
import { getCurrentUser, logout } from './services/authService.ts';
import { requestNotifPermission } from './services/notificationService.ts';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [lang, setLang] = useState<Language>('fr');
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);

  useEffect(() => {
    const session = getCurrentUser();
    if (session) {
        setUser(session);
        requestNotifPermission(); // Demander la permission navigateur dès le login
    }
    setLoading(false);

    // Écouter les notifications globales
    const handleNotif = (e: any) => {
        setActiveToast(e.detail);
        setTimeout(() => setActiveToast(null), 6000); // Disparaît après 6s
    };
    window.addEventListener('app-notification', handleNotif);
    return () => window.removeEventListener('app-notification', handleNotif);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      document.body.style.backgroundColor = '#0f172a';
    } else {
      document.body.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc';
    }
  }, [darkMode]);

  const renderView = () => {
    switch (currentView) {
      case ViewMode.DASHBOARD: return <Dashboard onViewChange={setCurrentView} lang={lang} />;
      case ViewMode.ORDERS: return <Orders lang={lang} />;
      case ViewMode.STOCK: return <Stock lang={lang} />;
      // Fix: Added missing lang prop required by Logistics component
      case ViewMode.LOGISTICS: return <Logistics lang={lang} />;
      case ViewMode.FINANCE: return <Finance lang={lang} />;
      case ViewMode.ACCOUNTING: return <Accounting lang={lang} />;
      case ViewMode.MARKETING: return <Marketing lang={lang} onViewChange={setCurrentView} />;
      case ViewMode.HR: return <HR lang={lang} />;
      case ViewMode.SETTINGS: return <Settings />;
      default: return <div className="p-12 text-center text-slate-400">Module en développement...</div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth onLoginSuccess={(u) => setUser(u)} />;
  }

  return (
    <div className={`flex h-screen overflow-hidden font-sans ${darkMode ? 'dark' : ''}`} dir={isRTL(lang) ? 'rtl' : 'ltr'}>
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        lang={lang} 
        setLang={setLang} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
      />
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300">
        <header className="h-16 bg-white dark:bg-slate-900 border-b dark:border-slate-800 flex justify-between items-center px-6 z-10 flex-shrink-0">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-tight">{lang === 'ar' ? '' : currentView}</h2>
            </div>
            <div className="flex items-center gap-4">
                <div className="hidden md:block text-right">
                    <div className="text-sm font-bold dark:text-white">{user.companyName}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{user.role}</div>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold border border-blue-200 cursor-pointer hover:ring-2 ring-blue-500 transition-all shadow-sm" onClick={logout} title="Déconnexion">
                    {user.name.charAt(0)}
                </div>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {renderView()}
        </div>

        {/* Floating Toast Notification Area */}
        {activeToast && (
            <div className={`fixed top-20 ${isRTL(lang) ? 'left-6' : 'right-6'} z-50 animate-in slide-in-from-right-10 duration-300`}>
                <div className={`max-w-xs p-4 rounded-2xl shadow-2xl border flex gap-4 ${
                    activeToast.type === 'error' ? 'bg-red-50 border-red-100 text-red-800' :
                    activeToast.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                    'bg-white border-slate-200 text-slate-800'
                } dark:bg-slate-900 dark:border-slate-800`}>
                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${
                        activeToast.type === 'error' ? 'bg-red-100 text-red-600' :
                        activeToast.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                        'bg-blue-100 text-blue-600'
                    }`}>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    </div>
                    <div>
                        <h4 className="font-black text-sm">{activeToast.title}</h4>
                        <p className="text-xs mt-1 opacity-80 leading-relaxed font-medium">{activeToast.message}</p>
                    </div>
                    <button onClick={() => setActiveToast(null)} className="text-slate-400 hover:text-slate-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default App;
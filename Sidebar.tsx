
import React from 'react';
import { ViewMode, Language } from '../types.ts';
import { t, isRTL } from '../services/languageService.ts';

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  lang: Language;
  setLang: (l: Language) => void;
  darkMode: boolean;
  setDarkMode: (d: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, lang, setLang, darkMode, setDarkMode }) => {
  const getItemClass = (view: ViewMode) => {
    return `nav-item flex items-center px-6 py-4 rounded-2xl transition-all duration-300 cursor-pointer group mb-1 ${
        currentView === view 
        ? 'bg-ios-blue text-white shadow-xl shadow-ios-blue/20 scale-105 z-10' 
        : 'text-ios-label hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
    }`;
  };

  const menuItems = [
    { view: ViewMode.DASHBOARD, icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
    { view: ViewMode.ORDERS, icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
    { view: ViewMode.STOCK, icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
    { view: ViewMode.LOGISTICS, icon: "M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1" },
    { view: ViewMode.ACCOUNTING, icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { view: ViewMode.FINANCE, icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { view: ViewMode.MARKETING, icon: "M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" },
    { view: ViewMode.HR, icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { view: ViewMode.SETTINGS, icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
  ];

  return (
    <aside className="w-72 apple-card-premium flex flex-col z-30 h-[calc(100vh-48px)] overflow-hidden hidden md:flex m-6 rounded-[32px] border border-white/40">
        <div className="h-28 flex flex-col justify-center px-10 border-b border-black/5 dark:border-white/5 bg-white/10">
            <span className="text-2xl font-black text-black dark:text-white tracking-tighter">Phygital<span className="text-ios-blue">OS</span></span>
            <span className="text-[10px] font-black text-ios-label uppercase tracking-[0.3em] mt-2 opacity-50">Management Suite</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-1 no-scrollbar">
            {menuItems.map((item, idx) => (
                <div key={item.view} onClick={() => onViewChange(item.view)} className={`${getItemClass(item.view)} animate-apple-in`} style={{ animationDelay: `${idx * 0.05}s` }}>
                    <svg className={`w-5 h-5 ${isRTL(lang) ? 'ml-4' : 'mr-4'} transition-transform duration-300 group-hover:scale-110`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={item.icon}/>
                    </svg>
                    <span className="font-bold tracking-tight text-sm uppercase tracking-wide">{t(item.view as any, lang)}</span>
                </div>
            ))}
        </nav>

        <div className="p-8 space-y-6 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/5 dark:border-white/5">
            <div className="bg-white/50 dark:bg-white/5 p-1 rounded-2xl flex items-center gap-1 border border-black/5 dark:border-white/10 shadow-inner">
                {['fr', 'en', 'ar'].map(l => (
                  <button key={l} onClick={() => setLang(l as any)} className={`flex-1 text-[11px] font-black py-2.5 rounded-xl transition-all ${lang === l ? 'bg-white dark:bg-slate-700 text-ios-blue shadow-md scale-105' : 'text-ios-label hover:text-black dark:hover:text-white'}`}>{l.toUpperCase()}</button>
                ))}
            </div>
            
            <button 
                onClick={() => setDarkMode(!darkMode)} 
                className="w-full flex items-center justify-between px-3 py-2 group"
            >
                <span className="text-[10px] font-black text-ios-label uppercase tracking-widest group-hover:text-black dark:group-hover:text-white transition-colors">Mode Jour</span>
                <div className={`w-12 h-7 rounded-full relative transition-all duration-300 ${darkMode ? 'bg-ios-blue' : 'bg-slate-300 dark:bg-slate-700'}`}>
                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-xl ${darkMode ? 'left-6' : 'left-1'}`}></div>
                </div>
            </button>
        </div>
    </aside>
  );
};

export default Sidebar;

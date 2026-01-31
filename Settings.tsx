
import React, { useState, useEffect } from 'react';
import { fetchDashboardData } from '../services/sheetService';
import { fetchAdAccounts, AdAccount } from '../services/marketingService';

const Settings: React.FC = () => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [apiKeys, setApiKeys] = useState({
      yalidine: '',
      yalidineToken: '',
      fbAds: '',
      fbAccountId: '', 
      tiktokAds: ''
  });
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  
  // UI States
  const [activeTab, setActiveTab] = useState<'general' | 'integrations'>('integrations');
  const [expandedIntegration, setExpandedIntegration] = useState<string | null>(null);
  const [showManualFb, setShowManualFb] = useState(false); // Toggle for dev mode
  
  // Connection Status Tests
  const [sheetStatus, setSheetStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [sheetMsg, setSheetMsg] = useState('');

  useEffect(() => {
    // 1. Load saved data
    const savedUrl = localStorage.getItem('sheet_csv_url');
    if (savedUrl) setSheetUrl(savedUrl);
    
    setApiKeys({
        yalidine: localStorage.getItem('api_yalidine') || '',
        yalidineToken: localStorage.getItem('api_yalidine_token') || '',
        fbAds: localStorage.getItem('api_fb_ads') || '',
        fbAccountId: localStorage.getItem('api_fb_account_id') || '',
        tiktokAds: localStorage.getItem('api_tiktok') || ''
    });

    // 2. OAuth Callback Listener (For when Backend redirects back here)
    // Looks for http://myapp.com/?fb_token=XYZ...
    const urlParams = new URLSearchParams(window.location.search);
    const incomingToken = urlParams.get('fb_token');
    if (incomingToken) {
        localStorage.setItem('api_fb_ads', incomingToken);
        setApiKeys(prev => ({ ...prev, fbAds: incomingToken }));
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        alert("Connexion Facebook réussie !");
        setExpandedIntegration('facebook'); // Open panel to finish config
    }

  }, []);

  const convertToCsvUrl = (url: string) => {
    let cleanUrl = url.trim();
    const match = cleanUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      return `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
    }
    return cleanUrl;
  };

  const handleSaveSheet = async () => {
    setSheetStatus('testing');
    setSheetMsg('Vérification...');
    const csvUrl = convertToCsvUrl(sheetUrl);
    setSheetUrl(csvUrl);

    try {
      localStorage.setItem('sheet_csv_url', csvUrl);
      const result = await fetchDashboardData();
      
      if (result.orders.length === 0) {
        setSheetStatus('error');
        setSheetMsg('Connecté, mais aucune commande trouvée.');
      } else {
        setSheetStatus('success');
        setSheetMsg(`Synchronisé : ${result.orders.length} commandes.`);
        setExpandedIntegration(null); // Close on success
      }
    } catch (e: any) {
      console.error(e);
      setSheetStatus('error');
      if (e.message.includes('page Web')) {
         setSheetMsg("Erreur: Le lien n'est pas un CSV direct.");
      } else {
         setSheetMsg('Erreur d\'accès. Vérifiez le lien public.');
      }
    }
  };

  const handleFetchAdAccounts = async () => {
      if(!apiKeys.fbAds) {
          alert("Token manquant.");
          return;
      }
      setIsLoadingAccounts(true);
      try {
          const accounts = await fetchAdAccounts(apiKeys.fbAds);
          setAdAccounts(accounts);
          if (accounts.length > 0 && !apiKeys.fbAccountId) {
              setApiKeys(prev => ({ ...prev, fbAccountId: accounts[0].id }));
          }
      } catch (e) {
          alert("Erreur: Impossible de récupérer les comptes. Token invalide ?");
      } finally {
          setIsLoadingAccounts(false);
      }
  };

  const handleSaveApis = () => {
      localStorage.setItem('api_yalidine', apiKeys.yalidine);
      localStorage.setItem('api_yalidine_token', apiKeys.yalidineToken);
      localStorage.setItem('api_fb_ads', apiKeys.fbAds);
      localStorage.setItem('api_fb_account_id', apiKeys.fbAccountId);
      localStorage.setItem('api_tiktok', apiKeys.tiktokAds);
      
      setExpandedIntegration(null); // Close panel
      alert("Configuration sauvegardée !");
  };

  const handleFacebookLogin = () => {
      // PROD: This points to your future Node.js backend
      // DEV: For now, we alert the user
      alert("Backend Requis : Cette fonctionnalité nécessitera le serveur Node.js que nous allons configurer. En attendant, utilisez le mode 'Manuel' ci-dessous.");
      // window.location.href = 'http://localhost:3000/auth/facebook'; 
  };

  const handleDisconnectFacebook = () => {
      setApiKeys(prev => ({ ...prev, fbAds: '', fbAccountId: '' }));
      localStorage.removeItem('api_fb_ads');
      localStorage.removeItem('api_fb_account_id');
      setAdAccounts([]);
  };

  // --- BACKUP & RESTORE ---
  const handleExportData = () => {
      const backupData = {
          timestamp: new Date().toISOString(),
          version: '1.0',
          data: { ...localStorage }
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `phygital_backup_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const json = JSON.parse(event.target?.result as string);
              if (json.data) {
                  Object.keys(json.data).forEach(key => localStorage.setItem(key, json.data[key]));
                  window.location.reload();
              }
          } catch (err) { alert("Fichier invalide."); }
      };
      reader.readAsText(file);
  };

  const IntegrationCard = ({ 
      id, 
      name, 
      icon, 
      isConnected, 
      description,
      colorClass
  }: { id: string, name: string, icon: any, isConnected: boolean, description: string, colorClass: string }) => (
      <div className={`glass-card dark:bg-slate-800 dark:border-slate-700 p-6 flex flex-col justify-between transition-all duration-300 ${expandedIntegration === id ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'}`}>
          <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 dark:bg-opacity-20`}>
                 {icon}
              </div>
              <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isConnected ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                  {isConnected ? 'Connecté' : 'Déconnecté'}
              </div>
          </div>
          <div>
              <h4 className="font-bold text-lg text-slate-800 dark:text-white mb-1">{name}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 h-10">{description}</p>
          </div>
          <button 
            onClick={() => setExpandedIntegration(expandedIntegration === id ? null : id)}
            className={`w-full py-2.5 rounded-lg font-bold text-sm transition-colors border ${isConnected ? 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'}`}
          >
              {expandedIntegration === id ? 'Fermer' : isConnected ? 'Configurer' : 'Connecter'}
          </button>
      </div>
  );

  return (
    <div className="view-section max-w-5xl mx-auto space-y-8">
      
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
          <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white">Paramètres & Intégrations</h2>
              <p className="text-slate-500 dark:text-slate-400">Gérez vos connexions externes et vos préférences.</p>
          </div>
          <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button 
                onClick={() => setActiveTab('integrations')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'integrations' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  Intégrations
              </button>
              <button 
                onClick={() => setActiveTab('general')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'general' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  Sauvegardes
              </button>
          </div>
      </div>

      {activeTab === 'integrations' && (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* 1. GOOGLE SHEETS */}
                <IntegrationCard 
                    id="sheets"
                    name="Google Sheets"
                    description="Source principale pour les commandes et le stock."
                    isConnected={!!localStorage.getItem('sheet_csv_url')}
                    colorClass="text-emerald-600 bg-emerald-100"
                    icon={<svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/></svg>}
                />

                {/* 2. FACEBOOK ADS */}
                <IntegrationCard 
                    id="facebook"
                    name="Facebook Ads"
                    description="Synchronisation des dépenses et du ROAS."
                    isConnected={!!apiKeys.fbAds && !!apiKeys.fbAccountId}
                    colorClass="text-blue-600 bg-blue-100"
                    icon={<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>}
                />

                {/* 3. YALIDINE */}
                <IntegrationCard 
                    id="yalidine"
                    name="Yalidine Exp."
                    description="Suivi automatique des colis en temps réel."
                    isConnected={!!apiKeys.yalidine}
                    colorClass="text-orange-600 bg-orange-100"
                    icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>}
                />
            </div>

            {/* EXPANDED CONFIGURATION PANELS */}
            
            {/* GOOGLE SHEETS CONFIG */}
            {expandedIntegration === 'sheets' && (
                <div className="glass-card dark:bg-slate-800 dark:border-slate-700 p-6 border-l-4 border-emerald-500 animate-in fade-in slide-in-from-top-2">
                    <h3 className="font-bold text-lg mb-4 dark:text-white">Configuration Google Sheets</h3>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Lien Public (Lecture Seule)</label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={sheetUrl} 
                                onChange={(e) => setSheetUrl(e.target.value)} 
                                className="filter-input flex-1" 
                                placeholder="https://docs.google.com/spreadsheets/d/..."
                            />
                            <button onClick={handleSaveSheet} className="btn-primary" disabled={sheetStatus === 'testing'}>
                                {sheetStatus === 'testing' ? 'Test...' : 'Valider'}
                            </button>
                        </div>
                        {sheetMsg && <p className={`text-xs mt-2 font-bold ${sheetStatus === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>{sheetMsg}</p>}
                    </div>
                </div>
            )}

            {/* FACEBOOK ADS CONFIG */}
            {expandedIntegration === 'facebook' && (
                <div className="glass-card dark:bg-slate-800 dark:border-slate-700 p-6 border-l-4 border-blue-600 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="font-bold text-lg dark:text-white">Connexion Facebook Ads</h3>
                            <p className="text-sm text-slate-500">Autorisez l'application à lire vos dépenses publicitaires.</p>
                        </div>
                    </div>

                    {!apiKeys.fbAds ? (
                         // MODE: NOT CONNECTED (Show big button)
                        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                             <div className="mb-4 bg-white dark:bg-slate-800 p-3 rounded-full shadow-sm">
                                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                             </div>
                             <button 
                                onClick={handleFacebookLogin}
                                className="w-full max-w-sm bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                             >
                                <span>Se connecter avec Facebook</span>
                             </button>
                             <p className="text-xs text-slate-400 mt-4 text-center max-w-xs">
                                Vous serez redirigé vers Facebook pour valider l'accès en lecture seule (Ads Read).
                             </p>
                        </div>
                    ) : (
                        // MODE: CONNECTED
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl p-6 mb-6">
                             <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-emerald-800 dark:text-emerald-300">Compte Connecté</h4>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400">Token actif. Accès autorisé.</p>
                                </div>
                             </div>
                             
                             <div className="mb-4">
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">Compte Publicitaire à suivre</label>
                                <div className="flex gap-2">
                                    <select 
                                        className="filter-input w-full"
                                        value={apiKeys.fbAccountId}
                                        onChange={e => setApiKeys({...apiKeys, fbAccountId: e.target.value})}
                                    >
                                        <option value="">-- Sélectionner un compte --</option>
                                        {adAccounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>
                                        ))}
                                    </select>
                                    <button onClick={handleFetchAdAccounts} disabled={isLoadingAccounts} className="btn-secondary px-3">
                                        {isLoadingAccounts ? '...' : 'Actualiser'}
                                    </button>
                                </div>
                             </div>

                             <div className="flex justify-end gap-3">
                                 <button onClick={handleDisconnectFacebook} className="text-red-500 hover:text-red-700 text-sm font-medium px-4 py-2">
                                     Déconnecter
                                 </button>
                                 <button onClick={handleSaveApis} className="btn-primary">
                                     Sauvegarder
                                 </button>
                             </div>
                        </div>
                    )}

                    {/* MANUAL OVERRIDE (For Devs) */}
                    <div className="mt-8 border-t border-slate-100 dark:border-slate-700 pt-4">
                        <button 
                            onClick={() => setShowManualFb(!showManualFb)}
                            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1"
                        >
                            {showManualFb ? 'Masquer' : 'Afficher'} configuration manuelle (Avancé)
                            <svg className={`w-3 h-3 transition-transform ${showManualFb ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                        </button>
                        
                        {showManualFb && (
                            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl animate-in fade-in slide-in-from-top-1">
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">Access Token (Graph API)</label>
                                <input 
                                    type="password" 
                                    className="filter-input mb-2" 
                                    value={apiKeys.fbAds} 
                                    onChange={e => setApiKeys({...apiKeys, fbAds: e.target.value})} 
                                    placeholder="EAA..." 
                                />
                                <div className="flex justify-end">
                                    <button onClick={handleFetchAdAccounts} className="text-xs font-bold text-blue-600 hover:underline">Vérifier le token</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* YALIDINE CONFIG */}
             {expandedIntegration === 'yalidine' && (
                <div className="glass-card dark:bg-slate-800 dark:border-slate-700 p-6 border-l-4 border-orange-500 animate-in fade-in slide-in-from-top-2">
                    <h3 className="font-bold text-lg mb-4 dark:text-white">Configuration Yalidine Express</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">API Key</label>
                            <input type="text" className="filter-input" value={apiKeys.yalidine} onChange={e => setApiKeys({...apiKeys, yalidine: e.target.value})} />
                        </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Tracking Token</label>
                            <input type="password" className="filter-input" value={apiKeys.yalidineToken} onChange={e => setApiKeys({...apiKeys, yalidineToken: e.target.value})} />
                        </div>
                    </div>
                     <div className="mt-4 flex justify-end">
                        <button onClick={handleSaveApis} className="btn-primary">Sauvegarder</button>
                    </div>
                </div>
            )}
        </div>
      )}

      {activeTab === 'general' && (
         <div className="glass-card dark:bg-slate-800 dark:border-slate-700 p-8">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Sauvegarde & Restauration</h3>
            <p className="text-slate-500 text-sm mb-6">Exportez toute votre configuration (Liens, Stocks, Journal) dans un fichier JSON sécurisé.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button onClick={handleExportData} className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
                    <svg className="w-10 h-10 text-blue-500 mb-3 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    <span className="font-bold text-slate-700 dark:text-slate-300">Exporter les données</span>
                    <span className="text-xs text-slate-400 mt-1">Format .JSON</span>
                </button>
                <label className="cursor-pointer flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
                    <svg className="w-10 h-10 text-emerald-500 mb-3 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                    <span className="font-bold text-slate-700 dark:text-slate-300">Restaurer une sauvegarde</span>
                    <span className="text-xs text-slate-400 mt-1">Glissez votre fichier ici</span>
                    <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                </label>
            </div>
        </div>
      )}
    </div>
  );
};

export default Settings;


import React, { useEffect, useState } from 'react';
import { MarketingCampaign, MarketingAlert, Language, ViewMode } from '../types';
import { getMarketingData } from '../services/marketingService';

interface MarketingProps {
  lang: Language;
  onViewChange: (view: ViewMode) => void;
}

const Marketing: React.FC<MarketingProps> = ({ lang, onViewChange }) => {
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await getMarketingData();
      setCampaigns(data);
      setIsLoading(false);
    };
    load();
  }, []);

  const totalSpend = campaigns.reduce((acc, c) => acc + c.spend, 0);
  const totalPurchases = campaigns.reduce((acc, c) => acc + (c.purchases || 0), 0);
  const avgRoas = campaigns.length > 0 ? (campaigns.reduce((acc, c) => acc + (c.roas || 0), 0) / campaigns.length).toFixed(2) : "0.00";

  return (
    <div className="view-section max-w-7xl mx-auto space-y-10 py-4 animate-fade-up">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
                <h2 className="text-4xl font-black tracking-tight uppercase text-black dark:text-white">Marketing Ads</h2>
                <p className="text-ios-label text-sm font-bold opacity-70 mt-1 uppercase tracking-wider">Performance et ROI publicitaire</p>
            </div>
            <button onClick={() => setIsAlertModalOpen(true)} className="btn-apple bg-ios-indigo gap-2 shadow-lg shadow-ios-indigo/30">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                <span>Créer une alerte</span>
            </button>
        </div>

        {/* KPIs Marketing - RESTAURATION COMPLÈTE */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="apple-card-premium p-10 flex flex-col justify-center border-b-[6px] border-ios-indigo">
                <p className="text-[11px] font-black text-ios-label uppercase tracking-[0.2em] mb-3 opacity-60">Dépense Totale (Spend)</p>
                <h3 className="text-4xl font-black text-black dark:text-white">{totalSpend.toLocaleString()} DA</h3>
            </div>
            <div className="apple-card-premium p-10 flex flex-col justify-center border-b-[6px] border-ios-blue">
                <p className="text-[11px] font-black text-ios-label uppercase tracking-[0.2em] mb-3 opacity-60">Achats Attribués</p>
                <h3 className="text-4xl font-black text-ios-blue">{totalPurchases}</h3>
            </div>
            <div className="apple-card-premium p-10 flex flex-col justify-center border-b-[6px] border-ios-green">
                <p className="text-[11px] font-black text-ios-label uppercase tracking-[0.2em] mb-3 opacity-60">ROAS Moyen (Global)</p>
                <h3 className="text-4xl font-black text-ios-green">x{avgRoas}</h3>
            </div>
        </div>

        <div className="apple-card-premium overflow-hidden border border-black/5 dark:border-white/5">
            <div className="px-10 py-6 bg-black/[0.02] dark:bg-white/[0.05] border-b border-black/5">
                <h4 className="font-black text-[11px] uppercase tracking-[0.3em] text-ios-label">Performances par Campagne</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                  <thead className="bg-black/[0.03] dark:bg-white/[0.03] text-[10px] font-black text-ios-label uppercase tracking-widest">
                      <tr>
                        <th className="px-10 py-5">Campagne</th>
                        <th className="px-10 py-5">Statut</th>
                        <th className="px-10 py-5 text-right">Dépense</th>
                        <th className="px-10 py-5 text-center">Achats</th>
                        <th className="px-10 py-5 text-right">ROAS</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                      {campaigns.length > 0 ? campaigns.map(c => (
                          <tr key={c.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                              <td className="px-10 py-5 font-black uppercase tracking-tight text-black dark:text-white">{c.name}</td>
                              <td className="px-10 py-5">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${c.status === 'ACTIVE' ? 'bg-ios-green/10 text-ios-green' : 'bg-ios-label/10 text-ios-label'}`}>
                                  {c.status}
                                </span>
                              </td>
                              <td className="px-10 py-5 text-right font-bold text-black dark:text-white">{c.spend.toLocaleString()} DA</td>
                              <td className="px-10 py-5 text-center font-black text-ios-blue">{c.purchases}</td>
                              <td className="px-10 py-5 text-right font-black text-ios-green text-lg">x{c.roas}</td>
                          </tr>
                      )) : (
                        <tr><td colSpan={5} className="py-20 text-center text-ios-label font-black uppercase tracking-[0.3em] opacity-30">Aucune donnée marketing</td></tr>
                      )}
                  </tbody>
              </table>
            </div>
        </div>

        {isAlertModalOpen && (
            <div className="modal-overlay">
                <div className="apple-window p-10 sm:p-12 animate-apple-in">
                    <h3 className="text-3xl font-black text-center uppercase mb-10 text-ios-indigo tracking-tight">Nouvelle Smart Alert</h3>
                    <div className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[12px] font-black text-ios-label uppercase tracking-widest ml-1">Nom de l'alerte</label>
                           <input className="filter-input" placeholder="ex: Alerte ROAS faible" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[12px] font-black text-ios-label uppercase tracking-widest ml-1">Indicateur (KPI)</label>
                                <select className="filter-input">
                                    <option value="roas">ROAS</option>
                                    <option value="cpa">CPA (Coût Achat)</option>
                                    <option value="spend">Dépense Maximale</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[12px] font-black text-ios-label uppercase tracking-widest ml-1">Valeur Seuil</label>
                                <input type="number" step="0.1" className="filter-input" placeholder="ex: 2.5" />
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4 mt-12">
                        <button onClick={() => setIsAlertModalOpen(false)} className="btn-apple bg-ios-bg !text-black flex-1 border border-black/10">Fermer</button>
                        <button onClick={() => setIsAlertModalOpen(false)} className="btn-apple bg-ios-indigo flex-1 shadow-xl shadow-ios-indigo/20">Valider</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Marketing;

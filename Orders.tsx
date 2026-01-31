import React, { useEffect, useState } from 'react';
import { fetchDashboardData } from '../services/sheetService';
import { Order, Language } from '../types';
import { t } from '../services/languageService';
import { sendToYalidine } from '../services/yalidineService';
import { generateModuleInsight } from '../services/geminiService';
import { adjustStockByName, adjustPackagingStock } from '../services/stockService';
import { pushNotification } from '../services/notificationService';

interface OrdersProps {
    lang: Language;
}

const Orders: React.FC<OrdersProps> = ({ lang }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});
  const [creditStates, setCreditStates] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { orders } = await fetchDashboardData();
        setOrders(orders);
        const statuses: Record<string, string> = {};
        const credits: Record<string, boolean> = {};
        orders.forEach(o => {
            statuses[o.id] = o.status;
            credits[o.id] = o.isCredit || false;
        });
        setLocalStatuses(statuses);
        setCreditStates(credits);
      } catch (error) { console.error(error); }
      finally { setIsLoading(false); }
    };
    loadData();
  }, []);

  const toggleCredit = (orderId: string) => {
    setCreditStates(prev => ({ ...prev, [orderId]: !prev[orderId] }));
    pushNotification("Paiement", `Statut crédit mis à jour pour la commande #${orderId}`, "info");
  };

  const handleStatusChange = async (order: Order, newStatus: string) => {
    const oldStatus = localStatuses[order.id];
    setLocalStatuses(prev => ({ ...prev, [order.id]: newStatus }));

    // Confirmation -> Déduction Packaging & Envoi Yalidine
    if (newStatus === 'confirmed' && oldStatus !== 'confirmed') {
        // 1. Déduction Emballage Automatique
        const pkgSuccess = await adjustPackagingStock(-1);
        if (pkgSuccess) {
            pushNotification("Stock Emballage", "Un emballage a été déduit du stock.", "info");
        }

        // 2. Envoi Yalidine
        setIsSyncing(order.id);
        const success = await sendToYalidine(order);
        if (!success) setLocalStatuses(prev => ({ ...prev, [order.id]: oldStatus }));
        setIsSyncing(null);
    }

    // Retour / Annulation -> Réintégration Marchandise
    if ((newStatus === 'returned' || newStatus === 'cancelled') && oldStatus !== 'returned') {
        const success = await adjustStockByName(order.product, 1);
        if (success) {
            pushNotification(
                "Stock Automatisé",
                `Produit "${order.product}" réintégré au stock (+1).`,
                "success"
            );
        }
    }
  };

  const runAiAnalysis = async () => {
    setIsAiLoading(true);
    const insight = await generateModuleInsight("Orders Management", orders.slice(0, 10), lang);
    setAiInsight(insight);
    setIsAiLoading(false);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
        case 'delivered': return 'bg-ios-green text-white';
        case 'returned': return 'bg-ios-pink text-white';
        case 'shipping': return 'bg-ios-orange text-white';
        case 'confirmed': return 'bg-ios-blue text-white';
        default: return 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300';
    }
  };

  const filteredOrders = orders.filter(order => 
    order.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.phone.includes(searchTerm) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="view-section max-w-7xl mx-auto space-y-6 py-2">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="apple-glass p-1 rounded-ios-lg flex-1 max-w-lg flex items-center px-4">
                <svg className="w-5 h-5 text-ios-label mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" className="bg-transparent w-full h-12 outline-none text-sm font-semibold" placeholder={t('search', lang)} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <button onClick={runAiAnalysis} disabled={isAiLoading} className="btn-apple btn-indigo min-w-[200px] gap-2">
                {isAiLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.989-2.386l-.548-.547z"/></svg>
                )}
                <span>Gemini Analysis</span>
            </button>
        </div>

        {aiInsight && (
            <div className="apple-glass p-8 rounded-ios-xl border-l-4 border-ios-indigo animate-apple-in text-sm font-medium leading-relaxed">
                <div className="flex justify-between mb-3"><span className="text-[10px] font-bold uppercase text-ios-indigo tracking-widest">Business Intelligence</span><button onClick={() => setAiInsight(null)} className="text-ios-label hover:text-ios-pink transition-colors">Fermer</button></div>
                {aiInsight}
            </div>
        )}

        <div className="apple-glass rounded-ios-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-black/5 dark:bg-white/5 text-[11px] uppercase text-ios-label font-bold tracking-widest border-b border-black/5">
                        <tr>
                            <th className="px-8 py-5">Track ID / Colis</th>
                            <th className="px-8 py-5">Client & Contact</th>
                            <th className="px-8 py-5">Produit</th>
                            <th className="px-8 py-5 text-right">Total</th>
                            <th className="px-8 py-5 text-center">Crédit</th>
                            <th className="px-8 py-5 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                        {isLoading ? (
                            <tr><td colSpan={6} className="text-center py-20 text-ios-blue font-bold animate-pulse uppercase tracking-widest text-xs">Synchronisation...</td></tr>
                        ) : (
                            filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-black/[0.02] transition-colors">
                                    <td className="px-8 py-4">
                                        <div className="font-mono text-[11px] font-bold text-ios-blue bg-ios-blue/10 px-3 py-1.5 rounded-xl border border-ios-blue/10 w-fit">
                                            {order.id}
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="font-bold text-black dark:text-white truncate max-w-[180px]">{order.client}</div>
                                        <div className="text-[10px] font-bold text-ios-label">{order.phone} ({order.wilaya})</div>
                                    </td>
                                    <td className="px-8 py-4 text-[10px] font-medium opacity-70 truncate max-w-[150px]">{order.product}</td>
                                    <td className="px-8 py-4 text-right font-bold text-black dark:text-white">{order.total.toLocaleString()} DA</td>
                                    <td className="px-8 py-4 text-center">
                                        <button 
                                            onClick={() => toggleCredit(order.id)}
                                            className={`w-10 h-6 rounded-full relative transition-all duration-300 mx-auto ${creditStates[order.id] ? 'bg-ios-indigo' : 'bg-slate-300 dark:bg-slate-700'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${creditStates[order.id] ? 'left-5' : 'left-1'}`}></div>
                                        </button>
                                        <span className="text-[8px] font-black uppercase text-ios-label mt-1 block">Credit</span>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex justify-center relative">
                                            {isSyncing === order.id && <div className="absolute -left-6 top-1.5 w-4 h-4 border-2 border-ios-blue border-t-transparent rounded-full animate-spin"></div>}
                                            <select 
                                                value={localStatuses[order.id] || 'pending'}
                                                onChange={(e) => handleStatusChange(order, e.target.value)}
                                                className={`appearance-none font-bold text-[10px] uppercase tracking-widest py-2 px-5 rounded-full cursor-pointer focus:ring-4 ring-ios-blue/20 transition-all border border-transparent ${getStatusStyle(localStatuses[order.id])}`}
                                            >
                                                <option value="pending">En Attente</option>
                                                <option value="confirmed">Confirmé</option>
                                                <option value="shipping">En Route</option>
                                                <option value="delivered">Livré</option>
                                                <option value="returned">Retour</option>
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default Orders;
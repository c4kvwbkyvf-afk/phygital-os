
import React, { useEffect, useState, useRef } from 'react';
import { fetchDashboardData, DashboardMetrics } from '../services/sheetService';
import { Order, Language } from '../types';
import { generateModuleInsight } from '../services/geminiService';

const Logistics: React.FC<{ lang: Language }> = ({ lang }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [activeShipments, setActiveShipments] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { metrics, orders } = await fetchDashboardData();
        setMetrics(metrics);
        const relevant = orders.filter(o => o.status === 'shipping' || o.status === 'returned');
        setActiveShipments(relevant);
      } catch (error) { console.error(error); }
      finally { setIsLoading(false); }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isLoading || !metrics || !chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();
    
    chartInstance.current = new (window as any).Chart(chartRef.current, {
        type: 'doughnut',
        data: {
            labels: ['Livré', 'Retour', 'Transit'],
            datasets: [{
                data: [metrics.confirmed, metrics.returns, metrics.shipping],
                backgroundColor: ['#34C759', '#FF3B30', '#FF9500'],
                borderWidth: 0,
                cutout: '82%'
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { 
                legend: { 
                    display: true, 
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: { size: 10, weight: 'bold' }
                    }
                } 
            } 
        }
    });
  }, [metrics, isLoading]);

  const runAiLogistics = async () => {
    const insight = await generateModuleInsight("Logistics & Returns", metrics, lang);
    setAiInsight(insight);
  };

  return (
    <div className="view-section max-w-6xl mx-auto space-y-10 py-4 animate-fade-up">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
                <h3 className="text-4xl font-extrabold tracking-tight text-black dark:text-white">Logistique</h3>
                <p className="text-ios-label text-md font-medium mt-2">Pilotage dynamique des flux d'expédition.</p>
            </div>
            <button onClick={runAiLogistics} className="btn-apple btn-indigo min-w-[220px] gap-3 shadow-xl">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                <span>Optimize with Gemini</span>
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="apple-card-premium p-8 border-l-8 border-ios-indigo">
                <p className="text-[11px] font-extrabold text-ios-label uppercase tracking-widest mb-1">En Transit</p>
                <h3 className="text-4xl font-extrabold text-black dark:text-white">{metrics?.shipping || 0}</h3>
            </div>
            <div className="apple-card-premium p-8 border-l-8 border-ios-pink">
                <p className="text-[11px] font-extrabold text-ios-label uppercase tracking-widest mb-1">Taux de Retour</p>
                <h3 className="text-4xl font-extrabold text-ios-pink">{metrics?.returnRate || 0}%</h3>
            </div>
            <div className="apple-card-premium p-8 border-l-8 border-ios-green">
                <p className="text-[11px] font-extrabold text-ios-label uppercase tracking-widest mb-1">Délai Moyen</p>
                <h3 className="text-4xl font-extrabold text-ios-green">2.4 Jours</h3>
            </div>
            <div className="apple-card-premium p-8 border-l-8 border-ios-label">
                <p className="text-[11px] font-extrabold text-ios-label uppercase tracking-widest mb-1">Estimation Frais</p>
                <h3 className="text-4xl font-extrabold text-black dark:text-white">{(metrics?.returns || 0) * 500} DA</h3>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="apple-card-premium p-12 flex flex-col items-center justify-center relative min-h-[450px]">
                <h4 className="text-[11px] font-extrabold uppercase text-ios-label mb-12 tracking-widest">Flux Expéditions Global</h4>
                <div className="w-full h-80 relative">
                    <canvas ref={chartRef}></canvas>
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                        <span className="text-5xl font-extrabold text-black dark:text-white">{metrics?.deliveryRate}%</span>
                        <span className="text-[10px] font-extrabold text-ios-green uppercase tracking-widest mt-2">Succès</span>
                    </div>
                </div>
            </div>

            <div className="apple-card-premium p-10 flex flex-col min-h-[450px]">
                <h4 className="text-[11px] font-extrabold uppercase text-ios-label mb-8 tracking-widest">Derniers Mouvements</h4>
                <div className="space-y-4 flex-1 overflow-y-auto pr-2 no-scrollbar">
                    {activeShipments.slice(0, 8).map((order) => (
                        <div key={order.id} className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl flex justify-between items-center border border-black/5">
                            <div>
                                <p className="font-bold text-sm text-black dark:text-white">{order.client}</p>
                                <p className="text-[10px] text-ios-label font-bold uppercase">{order.wilaya} • {order.product}</p>
                            </div>
                            <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${order.status === 'returned' ? 'bg-ios-pink/10 text-ios-pink' : 'bg-ios-orange/10 text-ios-orange'}`}>
                                {order.status}
                            </span>
                        </div>
                    ))}
                    {activeShipments.length === 0 && (
                        <div className="text-center py-20 opacity-30 text-[10px] font-bold uppercase italic">Aucun mouvement récent</div>
                    )}
                </div>
            </div>
        </div>
        
        {aiInsight && (
            <div className="apple-card-premium p-10 border-l-8 border-ios-orange animate-apple-in">
                <p className="text-ios-orange mb-4 uppercase text-[11px] font-extrabold tracking-widest">Intelligence Logistique</p>
                <div className="text-md font-medium leading-relaxed dark:text-white/90">{aiInsight}</div>
            </div>
        )}
    </div>
  );
};

export default Logistics;

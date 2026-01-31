
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { fetchDashboardData, calculateMetrics, DashboardMetrics } from '../services/sheetService';
import { generateBusinessInsights } from '../services/geminiService';
import { monitorKPIs } from '../services/kpiMonitorService';
import { ViewMode, Language, Order } from '../types';
import { t } from '../services/languageService';

type DateFilter = 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'all';

const Dashboard: React.FC<{ onViewChange?: (v: ViewMode) => void; lang: Language }> = ({ onViewChange, lang }) => {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<DateFilter>('all');
  const [metrics, setMetrics] = useState<DashboardMetrics>({ 
    revenue: 0, 
    ordersToday: 0, 
    shipping: 0, 
    returns: 0, 
    confirmed: 0, 
    confirmationRate: 0, 
    deliveryRate: 0, 
    returnRate: 0,
    deliveredCount: 0 
  });
  const [isLoading, setIsLoading] = useState(true);
  const [insights, setInsights] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const mainChartRef = useRef<HTMLCanvasElement>(null);
  const charts = useRef<any>({});

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchDashboardData();
        setAllOrders(data.orders);
        setMetrics(data.metrics);
        monitorKPIs({ metrics: data.metrics });
      } catch (err) { console.error(err); }
      finally { setIsLoading(false); }
    };
    load();
  }, []);

  const filteredOrders = useMemo(() => {
    const now = new Date();
    const todayStr = now.toLocaleDateString('fr-FR');
    
    return allOrders.filter(o => {
      if (filter === 'all') return true;
      const [d, m, y] = o.date.split('/').map(Number);
      const oDate = new Date(y, m - 1, d);
      if (filter === 'today') return o.date === todayStr;
      if (filter === 'yesterday') {
        const yest = new Date(); yest.setDate(yest.getDate() - 1);
        return o.date === yest.toLocaleDateString('fr-FR');
      }
      if (filter === 'week') {
        const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
        return oDate >= weekAgo;
      }
      if (filter === 'month') return oDate.getMonth() === now.getMonth() && oDate.getFullYear() === now.getFullYear();
      if (filter === 'year') return oDate.getFullYear() === now.getFullYear();
      return true;
    });
  }, [allOrders, filter]);

  useEffect(() => {
    setMetrics(calculateMetrics(filteredOrders));
  }, [filteredOrders]);

  useEffect(() => {
    if (isLoading || filteredOrders.length === 0) return;
    if (charts.current.main) charts.current.main.destroy();
    
    const dateGroups = filteredOrders.reduce((acc: any, o) => {
        acc[o.date] = (acc[o.date] || 0) + (o.status === 'delivered' ? o.total : 0);
        return acc;
    }, {});
    const sortedDates = Object.keys(dateGroups).sort((a,b) => {
        const [d1,m1,y1] = a.split('/').map(Number);
        const [d2,m2,y2] = b.split('/').map(Number);
        return new Date(y1,m1-1,d1).getTime() - new Date(y2,m2-1,d1).getTime();
    }).slice(-15);

    if (mainChartRef.current) {
        charts.current.main = new (window as any).Chart(mainChartRef.current, {
            type: 'line',
            data: {
                labels: sortedDates.map(d => d.substring(0, 5)),
                datasets: [{ 
                  data: sortedDates.map(d => dateGroups[d]), 
                  borderColor: '#007AFF', 
                  backgroundColor: 'rgba(0, 122, 255, 0.03)', 
                  borderWidth: 4, 
                  tension: 0.45, 
                  fill: true, 
                  pointRadius: 0,
                  pointHoverRadius: 8,
                  pointHoverBackgroundColor: '#007AFF',
                  pointHoverBorderColor: '#fff',
                  pointHoverBorderWidth: 3
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { 
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        padding: 12,
                        cornerRadius: 12,
                        titleFont: { size: 10, weight: 'bold' },
                        bodyFont: { size: 14, weight: '800' }
                    }
                }, 
                scales: { 
                    y: { 
                        display: true,
                        grid: { color: 'rgba(0,0,0,0.02)' },
                        ticks: { font: { size: 10, weight: '600' }, color: '#8E8E93' }
                    }, 
                    x: { 
                        grid: { display: false }, 
                        ticks: { font: { size: 10, weight: '700' }, color: '#8E8E93' } 
                    } 
                } 
            }
        });
    }
  }, [filteredOrders, isLoading]);

  const handleGenerateInsights = async () => {
    setLoadingInsights(true);
    try {
      const result = await generateBusinessInsights(metrics, lang);
      setInsights(result);
    } catch (error) {
      setInsights("Erreur lors de la génération.");
    } finally {
      setLoadingInsights(false);
    }
  };

  const KPICard = ({ title, value, colorClass, subValue, index }: any) => (
    <div className={`apple-card-premium p-6 sm:p-8 animate-apple-in stagger-${index}`}>
        <div className="flex flex-col h-full relative z-10">
            <p className="text-[10px] sm:text-[12px] font-black text-ios-label uppercase tracking-[0.1em] mb-2 opacity-60">{title}</p>
            <h3 className="text-2xl sm:text-4xl font-black dark:text-white tracking-tight mb-4 truncate">{value}</h3>
            <div className={`mt-auto inline-flex items-center px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase ${colorClass} bg-opacity-10 border border-current w-fit`}>
                {subValue}
            </div>
        </div>
    </div>
  );

  return (
    <div className="view-section max-w-7xl mx-auto space-y-6 sm:space-y-10 py-4">
        {/* Date Filter - iOS 26 Liquid Pro Buttons */}
        <div className="flex overflow-x-auto pb-6 gap-3 no-scrollbar snap-x snap-mandatory px-1">
            {(['today', 'yesterday', 'week', 'month', 'all'] as DateFilter[]).map((f, i) => (
                <button 
                  key={f} 
                  onClick={() => setFilter(f)}
                  className={`btn-apple snap-start animate-apple-in stagger-${i+1} ${filter === f ? 'btn-blue scale-105' : 'apple-card-premium border-transparent !text-slate-500 hover:!text-black dark:hover:!text-white'}`}
                >
                    {f === 'today' ? "Aujourd'hui" : f === 'yesterday' ? "Hier" : f === 'week' ? "7 Jours" : f === 'month' ? "Mois" : "Tout"}
                </button>
            ))}
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            <KPICard index={1} title="Chiffre d'Affaires" value={`${metrics.revenue.toLocaleString()} DA`} colorClass="text-emerald-500" subValue="Revenu Livré" />
            <KPICard index={2} title="Commandes" value={metrics.ordersToday} colorClass="text-ios-blue" subValue="Entrées" />
            <KPICard index={3} title="Confirmation" value={`${metrics.confirmationRate}%`} colorClass={metrics.confirmationRate < 45 ? "text-rose-500" : "text-indigo-500"} subValue="Validation" />
            <KPICard index={4} title="Livraison" value={`${metrics.deliveryRate}%`} colorClass="text-emerald-500" subValue="Succès" />
        </div>

        <div className="w-full">
            <div className="apple-card-premium p-6 sm:p-10 animate-apple-in stagger-3">
                <div className="mb-10">
                    <h4 className="font-black text-[12px] uppercase tracking-[0.2em] text-ios-label">Performance</h4>
                    <p className="text-[11px] font-bold text-slate-400 mt-2 uppercase">Évolution des ventes (CA Net)</p>
                </div>
                <div className="h-[280px] sm:h-[400px] w-full"><canvas ref={mainChartRef}></canvas></div>
            </div>
        </div>

        {/* AI Insight Section */}
        <div className="apple-card-premium p-8 sm:p-12 border-ios-blue/10 animate-apple-in stagger-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-ios-blue to-ios-indigo rounded-3xl flex items-center justify-center text-white shadow-2xl relative">
                        <div className="absolute inset-0 bg-white/20 rounded-3xl blur-md animate-pulse"></div>
                        <svg className="w-8 h-8 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black tracking-tight uppercase dark:text-white">Strategic Intel</h3>
                        <p className="text-ios-label text-[10px] font-black uppercase tracking-[0.3em] mt-1 opacity-50">Gemini 3 Analytical Engine</p>
                    </div>
                </div>
                <button onClick={handleGenerateInsights} disabled={loadingInsights} className="btn-apple btn-blue hover:scale-105">
                    {loadingInsights ? 'Calcul stratégique...' : 'Générer Rapport IA'}
                </button>
            </div>
            {insights ? (
                <div className="bg-white/40 dark:bg-black/20 p-8 sm:p-12 rounded-[32px] text-[15px] leading-relaxed whitespace-pre-line animate-fade-up border border-white/20 shadow-inner italic">
                    {insights}
                </div>
            ) : (
                <div className="text-center py-16 text-ios-label text-[10px] font-black uppercase tracking-[0.3em] opacity-30">L'IA attend vos données pour l'analyse...</div>
            )}
        </div>
    </div>
  );
};

export default Dashboard;

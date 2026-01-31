import React, { useState, useEffect } from 'react';
import { fetchDashboardData, DashboardMetrics } from '../services/sheetService';
import { getMarketingData } from '../services/marketingService';
import { getTransactions } from '../services/accountingService';
import { Language } from '../types';

const Finance: React.FC<{ lang: Language }> = ({ lang }) => {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [marketingSpend, setMarketingSpend] = useState(0);
    const [productCostTotal, setProductCostTotal] = useState(0);
    const [packagingCostTotal, setPackagingCostTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [d, m, tx] = await Promise.all([fetchDashboardData(), getMarketingData(), getTransactions()]);
                setMetrics(d.metrics);
                
                // Dépenses Marketing
                setMarketingSpend(m.reduce((acc, c) => acc + c.spend, 0));
                
                // Coût Marchandises (Stock)
                setProductCostTotal(tx.filter(t => t.category === 'stock_purchase').reduce((acc, t) => acc + t.amount, 0));
                
                // Coût Emballage (Packaging)
                setPackagingCostTotal(tx.filter(t => t.category === 'packaging').reduce((acc, t) => acc + t.amount, 0));
                
            } catch (e) { console.error(e); } finally { setIsLoading(false); }
        };
        load();
    }, []);

    const revenue = metrics?.revenue || 0;
    const deliveredCount = metrics?.deliveredCount || 0;
    
    // Frais Logistiques (Yalidine approx)
    const returnFees = (metrics?.returns || 0) * 600;
    const shippingFees = (metrics?.revenue ? Math.round(metrics.revenue / 5000) : 0) * 800;
    
    // Profit Net Global
    const totalCosts = marketingSpend + productCostTotal + packagingCostTotal + returnFees + shippingFees;
    const netProfit = revenue - totalCosts;
    
    // Bénéfice par Commande (Formule demandée)
    // On divise le profit net total par le nombre de commandes livrées pour avoir la rentabilité unitaire réelle
    const profitPerOrder = deliveredCount > 0 ? Math.round(netProfit / deliveredCount) : 0;
    
    const marginPercent = revenue > 0 ? (netProfit / revenue) * 100 : 0;
    const breakEvenRoas = (revenue / (revenue - productCostTotal - returnFees - shippingFees - packagingCostTotal)).toFixed(2);

    return (
        <div className="view-section max-w-7xl mx-auto space-y-10 py-4 animate-fade-up">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                    <h3 className="text-4xl font-extrabold tracking-tight">Finance & Rentabilité</h3>
                    <p className="text-ios-label text-md font-medium mt-2">Analyse profonde de la performance financière.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                <div className="apple-card-premium p-8 border-l-8 border-ios-green">
                    <p className="text-[10px] font-black text-ios-label uppercase tracking-widest mb-1">Profit Net</p>
                    <h3 className={`text-2xl font-black ${netProfit > 0 ? 'text-ios-green' : 'text-ios-pink'}`}>{netProfit.toLocaleString()} DA</h3>
                    <p className="text-[9px] font-bold text-ios-label mt-2 uppercase tracking-wide">Marge: {marginPercent.toFixed(1)}%</p>
                </div>

                <div className="apple-card-premium p-8 border-l-8 border-ios-blue shadow-ios-blue/10 scale-105 z-10">
                    <p className="text-[10px] font-black text-ios-blue uppercase tracking-widest mb-1">Profit / Commande</p>
                    <h3 className={`text-3xl font-black ${profitPerOrder > 0 ? 'text-ios-blue' : 'text-ios-pink'}`}>{profitPerOrder.toLocaleString()} DA</h3>
                    <p className="text-[9px] font-bold text-ios-label mt-2 uppercase tracking-wide">Net par colis livré</p>
                </div>

                <div className="apple-card-premium p-8 border-l-8 border-ios-indigo">
                    <p className="text-[10px] font-black text-ios-label uppercase tracking-widest mb-1">Marketing</p>
                    <h3 className="text-2xl font-black text-ios-indigo">-{marketingSpend.toLocaleString()} DA</h3>
                    <p className="text-[9px] font-bold text-ios-label mt-2 uppercase tracking-wide">Ads & Social</p>
                </div>

                <div className="apple-card-premium p-8 border-l-8 border-ios-orange">
                    <p className="text-[10px] font-black text-ios-label uppercase tracking-widest mb-1">BE-ROAS</p>
                    <h3 className="text-2xl font-black text-ios-orange">x{breakEvenRoas}</h3>
                    <p className="text-[9px] font-bold text-ios-label mt-2 uppercase tracking-wide">Point Mort</p>
                </div>

                <div className="apple-card-premium p-8 border-l-8 border-ios-label">
                    <p className="text-[10px] font-black text-ios-label uppercase tracking-widest mb-1">Emballage</p>
                    <h3 className="text-2xl font-black text-black dark:text-white">-{packagingCostTotal.toLocaleString()} DA</h3>
                    <p className="text-[9px] font-bold text-ios-label mt-2 uppercase tracking-wide">Consommables</p>
                </div>
            </div>

            <div className="apple-card-premium p-12">
                <div className="flex justify-between items-center mb-10 border-b border-black/5 dark:border-white/5 pb-6">
                    <h4 className="font-extrabold text-sm uppercase tracking-widest flex items-center gap-4">
                        <svg className="w-6 h-6 text-ios-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        Analyse du Bénéfice Unitaire
                    </h4>
                    <span className="bg-ios-blue/10 text-ios-blue px-4 py-1 rounded-full text-[10px] font-black uppercase">Volume: {deliveredCount} Livraisons</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    <div className="space-y-6">
                        <div className="flex justify-between items-center py-2 border-b border-black/[0.03]">
                            <span className="font-bold text-ios-label uppercase tracking-widest text-[10px]">Encaissement Moyen</span>
                            <span className="font-extrabold text-ios-green">+{deliveredCount > 0 ? (revenue / deliveredCount).toFixed(0) : 0} DA</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-black/[0.03]">
                            <span className="font-bold text-ios-label uppercase tracking-widest text-[10px]">Coût Marchandise / Colis</span>
                            <span className="font-extrabold text-ios-pink">-{deliveredCount > 0 ? (productCostTotal / deliveredCount).toFixed(0) : 0} DA</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-black/[0.03]">
                            <span className="font-bold text-ios-label uppercase tracking-widest text-[10px]">Coût Pub / Colis</span>
                            <span className="font-extrabold text-ios-pink">-{deliveredCount > 0 ? (marketingSpend / deliveredCount).toFixed(0) : 0} DA</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-black/[0.03]">
                            <span className="font-bold text-ios-label uppercase tracking-widest text-[10px]">Emballage & Logistique / Colis</span>
                            <span className="font-extrabold text-ios-pink">-{deliveredCount > 0 ? ((packagingCostTotal + shippingFees + returnFees) / deliveredCount).toFixed(0) : 0} DA</span>
                        </div>
                    </div>
                    
                    <div className="bg-ios-blue/[0.03] dark:bg-white/5 p-12 rounded-[32px] border-2 border-dashed border-ios-blue/10 flex flex-col justify-center items-center text-center animate-apple-in">
                        <p className="text-[11px] font-extrabold text-ios-blue uppercase tracking-widest mb-4">Rentabilité par Commande</p>
                        <h2 className={`text-6xl font-black mb-6 ${profitPerOrder > 0 ? 'text-ios-blue' : 'text-ios-pink'}`}>
                            {profitPerOrder.toLocaleString()} DA
                        </h2>
                        <div className={`px-8 py-2.5 rounded-full text-xs font-black uppercase ${profitPerOrder > 500 ? 'bg-ios-green/10 text-ios-green' : 'bg-ios-pink/10 text-ios-pink'}`}>
                            {profitPerOrder > 500 ? 'Excellent ROI' : 'Optimisation Requise'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Finance;

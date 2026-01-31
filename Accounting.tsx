
import React, { useState, useEffect } from 'react';
import { Transaction, Language } from '../types';
import { getTransactions, saveTransaction, deleteTransaction } from '../services/accountingService';
import { t } from '../services/languageService';

const Accounting: React.FC<{ lang: Language }> = ({ lang }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [type, setType] = useState<'expense' | 'income'>('expense');
    const [category, setCategory] = useState<string>('sales');
    const [desc, setDesc] = useState('');
    const [amount, setAmount] = useState(0);

    const loadData = async () => {
        const data = await getTransactions();
        setTransactions(data);
    };

    useEffect(() => { loadData(); }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const tx: Transaction = {
            id: `tx-${Date.now()}`,
            date: Date.now(),
            type, 
            category: category as any,
            description: desc || (type === 'income' ? 'Recette' : 'Dépense'),
            amount: Number(amount)
        };
        await saveTransaction(tx);
        await loadData();
        setIsModalOpen(false);
        setAmount(0);
        setDesc('');
    };

    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);

    return (
        <div className="view-section max-w-6xl mx-auto space-y-10 py-4 animate-fade-up">
             <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h3 className="text-4xl font-black uppercase tracking-tight text-black dark:text-white">Comptabilité</h3>
                    <p className="text-ios-label text-sm font-bold opacity-70 mt-1 uppercase tracking-wider">Trésorerie et flux financiers</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <button 
                        onClick={() => { setType('income'); setCategory('sales'); setIsModalOpen(true); }} 
                        className="btn-apple bg-ios-green flex-1 gap-2 shadow-lg shadow-ios-green/30 active:scale-95"
                    >
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                         Recette
                    </button>
                    <button 
                        onClick={() => { setType('expense'); setCategory('stock_purchase'); setIsModalOpen(true); }} 
                        className="btn-apple bg-ios-pink flex-1 gap-2 shadow-lg shadow-ios-pink/30 active:scale-95"
                    >
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4"/></svg>
                         Dépense
                    </button>
                </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                 <div className="apple-card-premium p-8 border-b-[6px] border-ios-green">
                    <p className="text-[11px] font-black text-ios-label uppercase tracking-widest mb-2">Total Recettes</p>
                    <h3 className="text-3xl font-black text-ios-green">+{totalIncome.toLocaleString()} DA</h3>
                 </div>
                 <div className="apple-card-premium p-8 border-b-[6px] border-ios-pink">
                    <p className="text-[11px] font-black text-ios-label uppercase tracking-widest mb-2">Total Dépenses</p>
                    <h3 className="text-3xl font-black text-ios-pink">-{totalExpenses.toLocaleString()} DA</h3>
                 </div>
                 <div className="apple-card-premium p-8 border-b-[6px] border-ios-blue">
                    <p className="text-[11px] font-black text-ios-label uppercase tracking-widest mb-2">Balance Net</p>
                    <h3 className="text-3xl font-black text-ios-blue">{(totalIncome - totalExpenses).toLocaleString()} DA</h3>
                 </div>
             </div>

             <div className="apple-card-premium overflow-hidden border border-black/5 dark:border-white/5">
                <table className="w-full text-left text-sm">
                    <thead className="bg-black/[0.03] dark:bg-white/[0.05] text-[10px] font-black text-ios-label uppercase tracking-widest border-b border-black/5">
                        <tr>
                          <th className="px-8 py-5">Date</th>
                          <th className="px-8 py-5">Catégorie</th>
                          <th className="px-8 py-5">Note / Description</th>
                          <th className="px-8 py-5 text-right">Montant</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                        {transactions.length > 0 ? transactions.map(t => (
                            <tr key={t.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                                <td className="px-8 py-5 text-ios-label font-bold text-xs">{new Date(t.date).toLocaleDateString()}</td>
                                <td className="px-8 py-5"><span className="px-3 py-1 rounded-full text-[9px] font-black uppercase bg-black/5 dark:bg-white/10 text-ios-label border border-black/5">{t.category.replace('_', ' ')}</span></td>
                                <td className="px-8 py-5 font-black uppercase tracking-tight text-black dark:text-white">{t.description}</td>
                                <td className={`px-8 py-5 text-right font-black text-lg ${t.type === 'income' ? 'text-ios-green' : 'text-ios-pink'}`}>
                                  {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()} DA
                                </td>
                            </tr>
                        )) : (
                          <tr><td colSpan={4} className="py-20 text-center text-ios-label font-black uppercase tracking-[0.3em] opacity-30 italic">Aucune transaction</td></tr>
                        )}
                    </tbody>
                </table>
             </div>

             {isModalOpen && (
                <div className="modal-overlay animate-fade-in">
                    <div className="apple-window p-8 sm:p-12 animate-apple-in">
                        <form onSubmit={handleSave} className="space-y-8">
                            <h3 className={`text-3xl font-black text-center uppercase tracking-tight ${type === 'income' ? 'text-ios-green' : 'text-ios-pink'}`}>
                                {type === 'income' ? 'Nouvelle Recette' : 'Nouvelle Dépense'}
                            </h3>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[12px] font-black text-ios-label uppercase tracking-widest ml-1">Montant de l'opération (DA)</label>
                                    <input required type="number" className="filter-input" value={amount || ''} onChange={e => setAmount(Number(e.target.value))} placeholder="0.00" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[12px] font-black text-ios-label uppercase tracking-widest ml-1">Catégorie</label>
                                    <select className="filter-input cursor-pointer" value={category} onChange={e => setCategory(e.target.value)}>
                                        <option value="sales">Vente / Encaissement</option>
                                        <option value="stock_purchase">Achat Stock</option>
                                        <option value="ads">Publicité (Facebook/TikTok)</option>
                                        <option value="packaging">Emballage & Box</option>
                                        <option value="salary">Salaires</option>
                                        <option value="other">Autre frais</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[12px] font-black text-ios-label uppercase tracking-widest ml-1">Note / Description</label>
                                    <input type="text" className="filter-input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Détails de l'opération..." />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-apple bg-ios-bg !text-black flex-1 border border-black/10">Annuler</button>
                                <button type="submit" className={`btn-apple flex-1 shadow-xl ${type === 'income' ? 'bg-ios-green shadow-ios-green/20' : 'bg-ios-pink shadow-ios-pink/20'}`}>Valider</button>
                            </div>
                        </form>
                    </div>
                </div>
             )}
        </div>
    );
};

export default Accounting;

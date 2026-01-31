
import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { t } from '../services/languageService';

interface StaffMember {
    id: string;
    name: string;
    role: 'admin' | 'confirmateur' | 'logistique' | 'marketing';
    email: string;
    baseSalary: number;
    commissionRate: number; // DA per order
    totalCommissions: number;
    status: 'active' | 'inactive';
}

const HR: React.FC<{ lang: Language }> = ({ lang }) => {
    const [team, setTeam] = useState<StaffMember[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        role: 'confirmateur',
        email: '',
        baseSalary: 30000,
        commissionRate: 50
    });

    useEffect(() => {
        const savedTeam = localStorage.getItem('phygital_team');
        if (savedTeam) setTeam(JSON.parse(savedTeam));
        else {
            const defaultTeam: StaffMember[] = [
                { id: '1', name: 'Amine Admin', role: 'admin', email: 'admin@admin.com', baseSalary: 80000, commissionRate: 0, totalCommissions: 0, status: 'active' },
                { id: '2', name: 'Sarah Sarah', role: 'confirmateur', email: 'sarah@store.dz', baseSalary: 25000, commissionRate: 50, totalCommissions: 12500, status: 'active' }
            ];
            setTeam(defaultTeam);
            localStorage.setItem('phygital_team', JSON.stringify(defaultTeam));
        }
    }, []);

    const saveTeam = (newTeam: StaffMember[]) => {
        setTeam(newTeam);
        localStorage.setItem('phygital_team', JSON.stringify(newTeam));
    };

    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        const newMember: StaffMember = {
            id: `staff-${Date.now()}`,
            name: formData.name,
            role: formData.role as any,
            email: formData.email,
            baseSalary: formData.baseSalary,
            commissionRate: formData.commissionRate,
            totalCommissions: 0,
            status: 'active'
        };
        saveTeam([...team, newMember]);
        setIsModalOpen(false);
        setFormData({ name: '', role: 'confirmateur', email: '', baseSalary: 30000, commissionRate: 50 });
    };

    const deleteMember = (id: string) => {
        if(window.confirm(t('delete_confirm', lang))) {
            saveTeam(team.filter(m => m.id !== id));
        }
    };

    return (
        <div className="view-section max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{t('hr', lang)}</h3>
                    <p className="text-slate-500 text-sm mt-1">Gérez votre équipe et leurs rémunérations</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                    {t('add_member', lang)}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="glass-card dark:bg-slate-800 p-6">
                    <p className="text-xs font-bold text-slate-500 uppercase">Masse Salariale</p>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1">
                        {team.reduce((acc, m) => acc + m.baseSalary + m.totalCommissions, 0).toLocaleString()} DA
                    </h3>
                </div>
                <div className="glass-card dark:bg-slate-800 p-6 border-l-4 border-blue-500">
                    <p className="text-xs font-bold text-slate-500 uppercase">Effectif</p>
                    <h3 className="text-3xl font-black text-blue-600 mt-1">{team.length}</h3>
                </div>
            </div>

            <div className="glass-card dark:bg-slate-800 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase text-xs font-bold border-b dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-4">Membre</th>
                            <th className="px-6 py-4">Rôle</th>
                            <th className="px-6 py-4 text-right">Base</th>
                            <th className="px-6 py-4 text-right">Commissions</th>
                            <th className="px-6 py-4 text-right">Total Net</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                        {team.map(m => (
                            <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-800 dark:text-white">{m.name}</div>
                                    <div className="text-xs text-slate-400">{m.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="badge badge-info">{m.role}</span>
                                </td>
                                <td className="px-6 py-4 text-right font-medium">{m.baseSalary.toLocaleString()} DA</td>
                                <td className="px-6 py-4 text-right text-emerald-600 font-bold">+{m.totalCommissions.toLocaleString()} DA</td>
                                <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-slate-100">{(m.baseSalary + m.totalCommissions).toLocaleString()} DA</td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => deleteMember(m.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border dark:border-slate-800">
                        <div className="px-6 py-4 border-b dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-lg font-bold dark:text-white">Ajouter un collaborateur</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <form onSubmit={handleAddMember} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Nom Complet</label>
                                    <input required type="text" className="filter-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Email Professionnel</label>
                                    <input required type="email" className="filter-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Rôle</label>
                                    <select className="filter-input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})}>
                                        <option value="confirmateur">Confirmateur</option>
                                        <option value="logistique">Logistique</option>
                                        <option value="marketing">Marketing</option>
                                        <option value="admin">Administrateur</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Salaire Fixe (DA)</label>
                                    <input required type="number" className="filter-input" value={formData.baseSalary} onChange={e => setFormData({...formData, baseSalary: Number(e.target.value)})} />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Commission (DA / commande livrée)</label>
                                    <input required type="number" className="filter-input" value={formData.commissionRate} onChange={e => setFormData({...formData, commissionRate: Number(e.target.value)})} />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Annuler</button>
                                <button type="submit" className="btn-primary">Créer le compte</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HR;

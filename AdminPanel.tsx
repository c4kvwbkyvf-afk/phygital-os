import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { getAllUsers, updateUserSubscription, deleteUser } from '../services/authService';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getAllUsers();
      // Filter out the super admin from the list to avoid self-deletion
      setUsers(data.filter(u => u.role !== 'admin'));
    } catch (error) {
      console.error("Failed to load users", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtend = async (userId: string, plan: string) => {
      if(window.confirm(`Prolonger l'abonnement de ${plan.toUpperCase()} pour 30 jours ?`)) {
          await updateUserSubscription(userId, plan, 30);
          await loadUsers();
          alert("Abonnement prolongé avec succès.");
      }
  };

  const handleDelete = async (userId: string) => {
      if(window.confirm("ATTENTION: Cette action est irréversible. Supprimer cet utilisateur ?")) {
          await deleteUser(userId);
          await loadUsers();
      }
  };

  const formatDate = (timestamp: number) => {
      return new Date(timestamp).toLocaleDateString('fr-FR', {
          day: '2-digit', month: '2-digit', year: 'numeric'
      });
  };

  const getStatusBadge = (user: User) => {
      if (user.subscriptionEndDate < Date.now()) {
          return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">Expiré</span>;
      }
      return <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold">Actif</span>;
  };

  return (
    <div className="view-section max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white">Administration SaaS</h2>
            <p className="text-slate-500">Gestion des clients et des abonnements.</p>
        </div>
        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm">
            Total Clients: {users.length}
        </div>
      </div>

      <div className="glass-card dark:bg-slate-800 dark:border-slate-700 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold uppercase text-xs border-b border-slate-200 dark:border-slate-700">
                    <tr>
                        <th className="px-6 py-4">Client / Entreprise</th>
                        <th className="px-6 py-4">Email (Login)</th>
                        <th className="px-6 py-4">Plan Actuel</th>
                        <th className="px-6 py-4">Expiration</th>
                        <th className="px-6 py-4 text-center">Statut</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                    {users.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-12 text-slate-400">Aucun client inscrit pour le moment.</td></tr>
                    ) : (
                        users.map(u => (
                            <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-800 dark:text-white">{u.companyName}</div>
                                    <div className="text-xs text-slate-400">{u.name}</div>
                                </td>
                                <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300 select-all">
                                    {u.email}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="uppercase font-bold text-xs tracking-wider text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600 px-2 py-1 rounded bg-slate-50 dark:bg-slate-900">
                                        {u.plan}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className={`font-medium ${u.subscriptionEndDate < Date.now() ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {formatDate(u.subscriptionEndDate)}
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                        Inscrit le {formatDate(u.createdAt)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {getStatusBadge(u)}
                                </td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    <button 
                                        onClick={() => handleExtend(u.id, u.plan)}
                                        className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg font-bold transition-colors border border-blue-200"
                                        title="Ajouter 30 jours"
                                    >
                                        +30 Jours
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(u.id)}
                                        className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg font-bold transition-colors border border-red-200"
                                    >
                                        Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
          </div>
      </div>
      
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm">
          <strong>Note Système :</strong> Ceci est le panneau de contrôle "Super Admin". Vous pouvez valider manuellement les paiements ici en prolongeant les dates d'abonnement. 
          Les mots de passe utilisateurs sont stockés de manière sécurisée (simulation) et ne sont pas visibles ici.
      </div>
    </div>
  );
};

export default AdminPanel;
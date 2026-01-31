import React, { useState } from 'react';
import { login, register } from '../services/authService.ts';
import { User } from '../types.ts';

interface AuthProps {
  onLoginSuccess: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [view, setView] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (view === 'login') {
        const res = await login(formData.email, formData.password);
        onLoginSuccess(res.user);
      } else {
        const res = await register({ ...formData, plan: 'starter' });
        onLoginSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F2F7] dark:bg-black p-6 transition-colors duration-500">
      <div className="max-w-[420px] w-full apple-glass rounded-ios-xl overflow-hidden p-10 border border-white/20">
        <div className="text-center mb-10">
          <div className="inline-block px-3 py-1 bg-ios-blue/10 rounded-full mb-3">
             <span className="text-[10px] font-bold text-ios-blue uppercase tracking-widest">v26 Enterprise</span>
          </div>
          <h1 className="text-4xl font-bold text-black dark:text-white tracking-tight">Phygital<span className="text-ios-blue">OS</span></h1>
          <p className="text-ios-label text-sm mt-2 font-medium">L'intelligence opérationnelle de demain.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-semibold text-center animate-apple-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {view === 'register' && (
            <>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-ios-label uppercase tracking-widest ml-1">Nom Complet</label>
                <input 
                  type="text" 
                  required 
                  className="filter-input h-12" 
                  placeholder="ex: Ahmed Ben"
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-ios-label uppercase tracking-widest ml-1">Entreprise</label>
                <input 
                  type="text" 
                  required 
                  className="filter-input h-12" 
                  placeholder="Nom de votre boutique"
                  value={formData.companyName} 
                  onChange={e => setFormData({...formData, companyName: e.target.value})} 
                />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-ios-label uppercase tracking-widest ml-1">Email</label>
            <input 
              type="email" 
              required 
              className="filter-input h-12" 
              placeholder="votre@email.com" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-ios-label uppercase tracking-widest ml-1">Mot de passe</label>
            <input 
              type="password" 
              required 
              className="filter-input h-12" 
              placeholder="••••••••" 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full btn-apple btn-blue mt-6 h-12 text-sm uppercase tracking-widest flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <span>{view === 'login' ? 'Accéder au Système' : 'Créer un Compte'}</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setView(view === 'login' ? 'register' : 'login')} 
            className="text-xs font-semibold text-ios-blue hover:underline transition-all"
          >
            {view === 'login' ? "Nouveau ici ? Créer un identifiant Phygital" : "Déjà membre ? Se connecter"}
          </button>
        </div>

        <div className="mt-10 pt-6 border-t border-black/5 dark:border-white/10 text-center">
            <p className="text-[10px] text-ios-label uppercase font-bold tracking-[0.2em] opacity-50">Sécurisé par Chiffrement RSA</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
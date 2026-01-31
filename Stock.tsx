
import React, { useEffect, useState } from 'react';
import { Product, Language } from '../types';
import { getStock, saveProduct, deleteProduct } from '../services/stockService';
import { t } from '../services/languageService';

const Stock: React.FC<{ lang: Language }> = ({ lang }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({ name: '', sku: '', stock: 0, purchasePrice: 0, sellPrice: 0, isPackaging: false });

  const loadStock = async () => {
    setIsLoading(true);
    const data = await getStock();
    setProducts(data);
    setIsLoading(false);
  };

  useEffect(() => { loadStock(); }, []);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setFormData({ 
        name: product.name, 
        sku: product.sku, 
        stock: product.stock, 
        purchasePrice: product.purchasePrice, 
        sellPrice: product.sellPrice,
        isPackaging: product.isPackaging || false
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', sku: '', stock: 0, purchasePrice: 0, sellPrice: 0, isPackaging: false });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      id: editingId || `prod-${Date.now()}`,
      name: formData.name,
      sku: formData.sku || `SKU-${Math.floor(Math.random() * 10000)}`,
      stock: Number(formData.stock),
      purchasePrice: Number(formData.purchasePrice),
      sellPrice: Number(formData.sellPrice),
      status: Number(formData.stock) > 0 ? 'active' : 'out_of_stock',
      isPackaging: formData.isPackaging
    };
    await saveProduct(newProduct);
    await loadStock();
    setIsModalOpen(false);
  };

  const filteredProducts = products.filter(p => !p.isPackaging && (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="view-section max-w-6xl mx-auto space-y-8 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="apple-card-premium flex-1 max-w-lg flex items-center px-5">
                <svg className="w-5 h-5 text-ios-label mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <input type="text" placeholder="Chercher un produit..." className="bg-transparent h-12 outline-none w-full font-medium text-sm" value={search} onChange={e => setSearch(e.target.value)} />
             </div>
             <button onClick={() => handleOpenModal()} className="btn-apple btn-blue gap-2 w-full md:w-auto">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
                <span>Nouveau Produit</span>
             </button>
        </div>

        <div className="apple-card-premium overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-black/[0.03] dark:bg-white/[0.03] text-[10px] font-bold text-ios-label uppercase tracking-widest border-b border-black/5">
                    <tr><th className="px-8 py-4">Produit</th><th className="px-8 py-4 text-center">Quantité</th><th className="px-8 py-4 text-right">Vente</th><th className="px-8 py-4 text-center">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {filteredProducts.map(p => (
                        <tr key={p.id} className="hover:bg-black/[0.01]">
                            <td className="px-8 py-4"><div className="font-bold text-black dark:text-white">{p.name}</div><div className="text-[10px] text-ios-label font-mono mt-0.5">{p.sku}</div></td>
                            <td className="px-8 py-4 text-center"><span className={`px-3 py-1 rounded-full text-[10px] font-bold ${p.stock < 10 ? 'bg-ios-pink/10 text-ios-pink' : 'bg-ios-green/10 text-ios-green'}`}>{p.stock} unités</span></td>
                            <td className="px-8 py-4 text-right font-bold text-ios-blue">{p.sellPrice.toLocaleString()} DA</td>
                            <td className="px-8 py-4 text-center">
                                <button onClick={() => handleOpenModal(p)} className="p-2 text-ios-blue hover:bg-ios-blue/5 rounded-lg transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5" /></svg></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {isModalOpen && (
            <div className="modal-overlay animate-fade-in">
                <div className="apple-window p-8 sm:p-10">
                    <form onSubmit={handleSave} className="space-y-6">
                        <h3 className="text-2xl font-bold tracking-tight text-center">{editingId ? 'Modifier Produit' : 'Nouveau Produit'}</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="sm:col-span-2 space-y-1.5">
                               <label className="text-[11px] font-bold text-ios-label uppercase tracking-wider ml-1">Nom de l'article</label>
                               <input required type="text" className="filter-input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div className="space-y-1.5">
                               <label className="text-[11px] font-bold text-ios-label uppercase tracking-wider ml-1">SKU / Référence</label>
                               <input type="text" className="filter-input" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} />
                            </div>
                            <div className="space-y-1.5">
                               <label className="text-[11px] font-bold text-ios-label uppercase tracking-wider ml-1">Stock Initial</label>
                               <input required type="number" className="filter-input" value={formData.stock} onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})} />
                            </div>
                            <div className="space-y-1.5">
                               <label className="text-[11px] font-bold text-ios-label uppercase tracking-wider ml-1">Prix d'Achat (DA)</label>
                               <input required type="number" className="filter-input" value={formData.purchasePrice} onChange={(e) => setFormData({...formData, purchasePrice: Number(e.target.value)})} />
                            </div>
                            <div className="space-y-1.5">
                               <label className="text-[11px] font-bold text-ios-label uppercase tracking-wider ml-1">Prix de Vente (DA)</label>
                               <input required type="number" className="filter-input" value={formData.sellPrice} onChange={(e) => setFormData({...formData, sellPrice: Number(e.target.value)})} />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5">
                            <input type="checkbox" id="isPkg" className="w-5 h-5 accent-ios-blue cursor-pointer" checked={formData.isPackaging} onChange={(e) => setFormData({...formData, isPackaging: e.target.checked})} />
                            <label htmlFor="isPkg" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">Consommable (Emballage / Box Yalidine)</label>
                        </div>

                        <div className="flex gap-4 pt-6">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-apple btn-gray flex-1">Fermer</button>
                            <button type="submit" className="btn-apple btn-blue flex-1">Enregistrer</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default Stock;

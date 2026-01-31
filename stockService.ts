
import { Product } from "../types";

const STOCK_KEY = 'phygital_local_stock';

export const getStock = async (): Promise<Product[]> => {
    const data = localStorage.getItem(STOCK_KEY);
    return data ? JSON.parse(data) : [];
};

export const saveProduct = async (product: Product): Promise<void> => {
    const products = await getStock();
    const index = products.findIndex(p => p.id === product.id);
    if (index > -1) {
        products[index] = product;
    } else {
        products.push(product);
    }
    localStorage.setItem(STOCK_KEY, JSON.stringify(products));
};

export const adjustStockByName = async (productName: string, amount: number): Promise<boolean> => {
    const products = await getStock();
    const index = products.findIndex(p => p.name.toLowerCase() === productName.toLowerCase());
    if (index > -1) {
        products[index].stock += amount;
        if (products[index].stock < 0) products[index].stock = 0;
        localStorage.setItem(STOCK_KEY, JSON.stringify(products));
        return true;
    }
    return false;
};

// Fonction pour déduire l'emballage par défaut (SKU ou Nom spécifique)
export const adjustPackagingStock = async (amount: number): Promise<boolean> => {
    const products = await getStock();
    // On cherche un produit marqué comme emballage ou nommé "Emballage"
    const index = products.findIndex(p => p.isPackaging || p.name.toLowerCase().includes('emballage'));
    if (index > -1) {
        products[index].stock += amount;
        if (products[index].stock < 0) products[index].stock = 0;
        localStorage.setItem(STOCK_KEY, JSON.stringify(products));
        return true;
    }
    return false;
};

export const deleteProduct = async (productId: string): Promise<void> => {
    const products = (await getStock()).filter(p => p.id !== productId);
    localStorage.setItem(STOCK_KEY, JSON.stringify(products));
};

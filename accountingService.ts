
import { Transaction } from "../types";
import { saveProduct } from "./stockService";

const TX_KEY = 'phygital_local_tx';

export const getTransactions = async (): Promise<Transaction[]> => {
    const data = localStorage.getItem(TX_KEY);
    return data ? JSON.parse(data) : [];
};

export const saveTransaction = async (tx: Transaction, stockData?: any): Promise<void> => {
    const txs = await getTransactions();
    txs.unshift(tx);
    localStorage.setItem(TX_KEY, JSON.stringify(txs));

    // Fix: Updated 'purchase' to 'stock_purchase' to match category union type
    if (stockData && tx.category === 'stock_purchase' && tx.isStockEntry) {
        await saveProduct({
            id: `prod-auto-${Date.now()}`,
            name: stockData.name,
            sku: stockData.sku || `SKU-${Date.now()}`,
            stock: stockData.qty,
            purchasePrice: stockData.unitCost,
            sellPrice: 0,
            status: 'active'
        });
    }
};

export const deleteTransaction = async (id: string): Promise<void> => {
    const txs = (await getTransactions()).filter(t => t.id !== id);
    localStorage.setItem(TX_KEY, JSON.stringify(txs));
};

export enum ViewMode {
  DASHBOARD = 'dashboard',
  ORDERS = 'orders',
  STOCK = 'stock',
  LOGISTICS = 'logistics',
  FINANCE = 'finance',
  ACCOUNTING = 'accounting',
  MARKETING = 'marketing',
  HR = 'hr',
  SETTINGS = 'settings',
  ADMIN = 'admin'
}

export type Language = 'fr' | 'en' | 'ar';

export interface User {
  id: string;
  email: string;
  name: string;
  companyName: string;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  role: 'user' | 'admin';
  subscriptionStatus: 'active' | 'expired' | 'trial';
  subscriptionEndDate: number;
  createdAt: number;
}

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    type: 'error' | 'warning' | 'success' | 'info';
    timestamp: number;
    read: boolean;
}

export interface Order {
  id: string;
  date: string;
  client: string;
  phone: string;
  wilaya: string;
  product: string;
  total: number;
  status: string;
  isCredit?: boolean; // Option Vente à Crédit
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  stock: number;
  purchasePrice: number;
  sellPrice: number;
  status: string;
  isPackaging?: boolean; // Distinguer l'emballage
}

export interface Transaction {
  id: string;
  date: number;
  type: 'expense' | 'income';
  category: 'stock_purchase' | 'currency_purchase' | 'ads' | 'packaging' | 'salary' | 'transport' | 'other' | 'sales';
  description: string;
  amount: number;
  isStockEntry?: boolean;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'LEARNING' | 'ERROR';
  spend: number;
  impressions: number;
  clicks: number;
  cpc: number;
  ctr: number;
  purchases: number;
  costPerPurchase: number;
  roas: number;
}

export interface MarketingAlert {
  id: string;
  name: string;
  kpi: 'roas' | 'cpa' | 'cpm' | 'ctr' | 'hook_rate' | 'hold_rate' | 'lp_view_rate' | 'frequency' | 'spend';
  condition: 'above' | 'below';
  value: number;
  currency: 'DA' | 'EUR';
  isActive: boolean;
}

export enum ModelType {
  TEXT = 'gemini-3-pro-preview',
  IMAGE = 'gemini-2.5-flash-image'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

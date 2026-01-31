
import { Order } from "../types";

export interface DashboardMetrics {
  revenue: number;
  ordersToday: number;
  shipping: number;
  returns: number;
  confirmed: number;
  confirmationRate: number;
  deliveryRate: number;
  returnRate: number;
  deliveredCount: number; // Nouveau: Nombre exact de colis livrés
}

const WILAYAS_58 = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", "Blida", "Bouira", 
  "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger", "Djelfa", "Jijel", "Sétif", "Saïda", 
  "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", 
  "Ouargla", "Oran", "El Bayadh", "Illizi", "Bordj Bou Arreridj", "Boumerdès", "El Tarf", "Tindouf", 
  "Tissemsilt", "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", 
  "Ghardaïa", "Relizane", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal", "Beni Abbès", "In Salah", 
  "In Guezzam", "Touggourt", "Djanet", "El M'Ghair", "El Meniaa"
];

const normalizeWilaya = (raw: string): string => {
  if (!raw) return "Inconnu";
  const clean = raw.trim().toLowerCase();
  for (const w of WILAYAS_58) {
    if (clean.includes(w.toLowerCase())) return w;
  }
  return raw.split(/[\s-/]+/)[0];
};

const normalizeDate = (raw: string): string => {
  if (!raw) return new Date().toLocaleDateString('fr-FR');
  let clean = raw.trim().split(' ')[0];
  const ddmmyyyy = clean.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
  if (ddmmyyyy) {
    return `${ddmmyyyy[1].padStart(2, '0')}/${ddmmyyyy[2].padStart(2, '0')}/${ddmmyyyy[3]}`;
  }
  const yyyymmdd = clean.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/);
  if (yyyymmdd) {
    return `${yyyymmdd[3].padStart(2, '0')}/${yyyymmdd[2].padStart(2, '0')}/${yyyymmdd[1]}`;
  }
  return clean;
};

const normalizeStatus = (status: string): 'delivered' | 'returned' | 'shipping' | 'confirmed' | 'pending' => {
  if (!status) return 'pending';
  const s = status.toLowerCase().trim();
  if (s === 'livree' || s === 'livrée' || s.includes('delivered')) return 'delivered';
  if (s === 'annule' || s === 'annulé' || s.includes('retour') || s.includes('refus') || s.includes('returned') || s.includes('cancelled')) return 'returned';
  if (s === 'en route' || s.includes('dispatch') || s.includes('transit') || s.includes('shipping') || s.includes('expédié')) return 'shipping';
  if (s === 'confirme' || s === 'confirmé' || s.includes('confirmed') || s.includes('ready')) return 'confirmed';
  return 'pending';
};

const parseCSV = (csvText: string): Order[] => {
  const lines = csvText.split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].toLowerCase().split(",").map(h => h.trim().replace(/^"|"$/g, ''));
  const getIdx = (keywords: string[]) => headers.findIndex(h => keywords.some(k => h === k || h.includes(k)));
  
  const idxDate = getIdx(['date', 'created_at', 'time']); 
  const idxClient = getIdx(['full name', 'client', 'name', 'nom']);
  const idxPhone = getIdx(['phone', 'tél', 'mobile', 'telephone']);
  const idxWilaya = getIdx(['province', 'wilaya', 'city', 'ville']);
  const idxProduct = getIdx(['product name', 'produit']);
  const idxPrice = getIdx(['total price', 'total', 'price', 'prix']);
  const idxStatus = getIdx(['situation', 'statut', 'status', 'état']);
  const idxTracking = getIdx(['tracking', 'track', 'colis']);

  const parsedOrders: Order[] = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(cell => cell.replace(/^"|"$/g, '').trim());
    if (row.length < 2) continue;
    
    parsedOrders.push({
      id: row[idxTracking] || `CMD-${i}`,
      date: normalizeDate(row[idxDate] || ''),
      client: row[idxClient] || 'Inconnu',
      phone: row[idxPhone] || '',
      wilaya: normalizeWilaya(row[idxWilaya] || ''),
      product: row[idxProduct] || 'Inconnu',
      total: parseFloat(row[idxPrice]?.replace(/[^\d.]/g, '') || '0'),
      status: normalizeStatus(row[idxStatus] || '')
    });
  }
  return parsedOrders;
};

export const calculateMetrics = (orders: Order[]): DashboardMetrics => {
    const delivered = orders.filter(o => o.status === 'delivered');
    const confirmed = orders.filter(o => o.status === 'confirmed');
    const shipping = orders.filter(o => o.status === 'shipping');
    const returned = orders.filter(o => o.status === 'returned');
    const closed = delivered.length + returned.length;

    return {
        revenue: delivered.reduce((sum, o) => sum + o.total, 0),
        ordersToday: orders.length,
        shipping: shipping.length,
        returns: returned.length,
        confirmed: confirmed.length,
        confirmationRate: orders.length > 0 ? Math.round(((confirmed.length + shipping.length + delivered.length + returned.length) / orders.length) * 100) : 0,
        deliveryRate: closed > 0 ? Math.round((delivered.length / closed) * 100) : 0,
        returnRate: closed > 0 ? Math.round((returned.length / closed) * 100) : 0,
        deliveredCount: delivered.length
    };
};

export const fetchDashboardData = async (): Promise<{ metrics: DashboardMetrics, orders: Order[] }> => {
  const url = localStorage.getItem('sheet_csv_url');
  if (!url) throw new Error("URL Sheet non configurée");
  const response = await fetch(url);
  const text = await response.text();
  const orders = parseCSV(text);
  return { metrics: calculateMetrics(orders), orders };
};

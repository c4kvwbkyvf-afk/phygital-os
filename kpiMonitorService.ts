
import { DashboardMetrics } from "./sheetService";
import { pushNotification } from "./notificationService";
import { Product, MarketingCampaign } from "../types";

export interface ExtendedMonitorData {
    metrics?: DashboardMetrics;
    products?: Product[];
    campaigns?: MarketingCampaign[];
    financeStats?: {
        netProfit: number;
        revenue: number;
    };
}

export const monitorKPIs = (data: ExtendedMonitorData) => {
    const { metrics, products, campaigns, financeStats } = data;

    // 1. Analyse des Ventes (Confirmation) - Seuil 45%
    if (metrics && metrics.confirmationRate < 45 && metrics.ordersToday > 5) {
        pushNotification(
            "Performance Ventes Faible",
            `Alerte : Le taux de confirmation est de ${metrics.confirmationRate}%. Objectif : 45% min.`,
            'error'
        );
    }

    // 2. Analyse Logistique (Retours) - Seuil 20%
    if (metrics && metrics.returnRate > 20) {
        pushNotification(
            "Alerte Logistique : Retours",
            `Attention, votre taux de retour est monté à ${metrics.returnRate}%. Le seuil critique de 20% est dépassé.`,
            'error'
        );
    }

    // 3. Analyse Marketing (ROAS) - Seuil 1.8
    if (campaigns && campaigns.length > 0) {
        const avgROAS = campaigns.reduce((acc, c) => acc + c.roas, 0) / campaigns.length;
        if (avgROAS < 1.8 && campaigns.some(c => c.spend > 1000)) {
            pushNotification(
                "Marketing Non Rentable",
                `ROAS moyen critique : ${avgROAS.toFixed(2)}. Arrêtez les campagnes à perte.`,
                'error'
            );
        }
    }

    // 4. Analyse Finance (Marge Nette) - Seuil 10%
    if (financeStats && financeStats.revenue > 0) {
        const marginPercent = (financeStats.netProfit / financeStats.revenue) * 100;
        if (marginPercent < 10) {
            pushNotification(
                "Marge Nette Critique",
                `Votre marge nette est de ${Math.round(marginPercent)}%. Seuil de sécurité : 15%.`,
                'warning'
            );
        }
    }

    // 5. Analyse des Stocks (Rupture) - Seuil 5 unités
    if (products && products.length > 0) {
        const outOfStock = products.filter(p => p.stock > 0 && p.stock < 5);
        if (outOfStock.length > 0) {
            pushNotification(
                "Stock Critique",
                `${outOfStock.length} produits sont presque épuisés. Réapprovisionnez rapidement.`,
                'warning'
            );
        }
    }
};

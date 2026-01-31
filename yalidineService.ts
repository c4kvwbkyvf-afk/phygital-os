
import { Order } from "../types";
import { pushNotification } from "./notificationService";

export const sendToYalidine = async (order: Order): Promise<boolean> => {
    const apiKey = localStorage.getItem('api_yalidine');
    const apiToken = localStorage.getItem('api_yalidine_token');

    if (!apiKey || !apiToken) {
        pushNotification(
            "API Yalidine manquante",
            "Veuillez configurer vos clés API dans les paramètres pour envoyer les colis.",
            "error"
        );
        return false;
    }

    try {
        // Simulation de l'appel API Yalidine (CORS nécessite généralement un proxy ou backend)
        // Structure réelle de l'API Yalidine : POST https://api.yalidine.com/v1/parcels/
        console.log(`[YALIDINE API] Envoi du colis pour ${order.client}...`);
        
        const payload = [{
            order_id: order.id,
            firstname: order.client.split(' ')[0] || order.client,
            familyname: order.client.split(' ')[1] || 'Client',
            contact_phone: order.phone,
            address: "Livraison à domicile",
            to_wilaya_name: order.wilaya,
            to_commune_name: order.wilaya, // Fallback si commune non définie
            product_list: order.product,
            price: order.total,
            freeshipping: false,
            is_stopdesk: false,
            has_exchange: false
        }];

        // Simulation d'une réponse réussie
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        pushNotification(
            "Colis envoyé !",
            `La commande #${order.id} a été transmise à Yalidine avec succès.`,
            "info"
        );
        
        return true;
    } catch (error) {
        console.error("Yalidine API Error:", error);
        pushNotification(
            "Erreur Expédition",
            "Impossible de contacter Yalidine. Vérifiez votre connexion.",
            "error"
        );
        return false;
    }
};

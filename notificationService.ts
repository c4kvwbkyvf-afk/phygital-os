
import { AppNotification } from "../types";

const NOTIFS_KEY = 'phygital_notifs';

export const getNotifications = (): AppNotification[] => {
    const data = localStorage.getItem(NOTIFS_KEY);
    return data ? JSON.parse(data) : [];
};

export const pushNotification = (title: string, message: string, type: AppNotification['type']) => {
    const notifs = getNotifications();
    const newNotif: AppNotification = {
        id: `notif-${Date.now()}`,
        title,
        message,
        type,
        timestamp: Date.now(),
        read: false
    };
    
    // Persistance locale
    localStorage.setItem(NOTIFS_KEY, JSON.stringify([newNotif, ...notifs].slice(0, 50)));

    // Notification Navigateur (si permise)
    if (Notification.permission === "granted") {
        new Notification(title, { body: message, icon: '/favicon.ico' });
    }

    // Simulation d'envoi d'email
    console.log(`%c[EMAIL ALERT] To: admin@phygital.dz | Subject: ${title}`, 'background: #2563eb; color: #fff; padding: 2px 5px; border-radius: 3px;');
    console.log(`Body: ${message}`);

    // Dispatch event pour l'UI
    window.dispatchEvent(new CustomEvent('app-notification', { detail: newNotif }));
};

export const requestNotifPermission = async () => {
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        await Notification.requestPermission();
    }
};

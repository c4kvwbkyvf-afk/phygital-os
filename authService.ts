
import { User, AuthResponse } from "../types";

const USERS_KEY = 'phygital_local_users';
const CURRENT_USER_KEY = 'phygital_current_session';

const getLocalUsers = (): User[] => {
    try {
        const data = localStorage.getItem(USERS_KEY);
        const users = data ? JSON.parse(data) : [];
        // Ajouter un admin par défaut si la liste est vide pour faciliter le premier accès
        if (users.length === 0) {
            const defaultAdmin: User = {
                id: 'admin-1',
                email: 'admin@admin.com',
                name: 'Administrateur',
                companyName: 'Ma Boutique',
                plan: 'pro',
                role: 'admin',
                subscriptionStatus: 'active',
                subscriptionEndDate: Date.now() + (365 * 24 * 60 * 60 * 1000),
                createdAt: Date.now()
            };
            localStorage.setItem(USERS_KEY, JSON.stringify([defaultAdmin]));
            return [defaultAdmin];
        }
        return users;
    } catch (e) {
        return [];
    }
};

const saveLocalUsers = (users: User[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
    await new Promise(r => setTimeout(r, 600)); // Petit délai pour le réalisme
    
    const users = getLocalUsers();
    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    
    if (!user) {
        throw new Error("Compte introuvable. Utilisez admin@admin.com ou créez un compte.");
    }
    
    // Dans cette version locale simplifiée, on valide l'email
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return { user, token: 'local-token-' + Date.now() };
};

export const register = async (data: any): Promise<AuthResponse> => {
    await new Promise(r => setTimeout(r, 800));
    
    const users = getLocalUsers();
    if (users.some(u => u.email === data.email)) {
        throw new Error("Cet email est déjà utilisé.");
    }

    const newUser: User = {
        id: `user-${Date.now()}`,
        email: data.email,
        name: data.name,
        companyName: data.companyName,
        plan: data.plan || 'starter',
        role: users.length === 0 ? 'admin' : 'user',
        subscriptionStatus: 'active',
        subscriptionEndDate: Date.now() + (14 * 24 * 60 * 60 * 1000), // 14 jours par défaut
        createdAt: Date.now()
    };

    users.push(newUser);
    saveLocalUsers(users);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    
    return { user: newUser, token: 'local-token-' + Date.now() };
};

export const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.reload();
};

export const getCurrentUser = (): User | null => {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    if (!data) return null;
    try {
        return JSON.parse(data);
    } catch (e) {
        return null;
    }
};

export const getAllUsers = async (): Promise<User[]> => getLocalUsers();

export const deleteUser = async (id: string) => {
    const users = getLocalUsers().filter(u => u.id !== id);
    saveLocalUsers(users);
};

export const updateUserSubscription = async (userId: string, newPlan: string, days: number) => {
    const users = getLocalUsers().map(u => {
        if (u.id === userId) {
            return {
                ...u,
                plan: newPlan as any,
                subscriptionStatus: 'active' as any,
                subscriptionEndDate: Date.now() + (days * 24 * 60 * 60 * 1000)
            };
        }
        return u;
    });
    saveLocalUsers(users);
};

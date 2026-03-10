import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

interface User {
    id: string;
    email: string;
    role: string;
    name: string;
    photo: string;
    token?: string;
    verificationStatus?: 'none' | 'pending' | 'approved' | 'rejected';
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isInitialized: boolean;
    setAuth: (user: User, token: string) => Promise<void>;
    logout: () => Promise<void>;
    initializeAuth: () => Promise<void>;
    updateUser: (updates: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isInitialized: false,

    setAuth: async (user: User, token: string) => {
        set({ user, token, isAuthenticated: true });
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
    },

    updateUser: async (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
            const updatedUser = { ...currentUser, ...updates };
            set({ user: updatedUser });
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        }
    },

    logout: async () => {
        try {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            set({ user: null, token: null, isAuthenticated: false });
            console.log('✅ Logged out successfully');
            router.replace('/');
        } catch (error) {
            console.error('❌ Logout error:', error);
        }
    },

    initializeAuth: async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const userStr = await AsyncStorage.getItem('user');

            if (token && userStr) {
                const user = JSON.parse(userStr);
                set({ user, token, isAuthenticated: true, isInitialized: true });
                console.log('✅ Auth initialized:', user.email);
            } else {
                set({ isInitialized: true });
                console.log('ℹ️ No saved auth found');
            }
        } catch (error) {
            set({ isInitialized: true });
            console.error('❌ Failed to load auth from storage:', error);
        }
    },
}));
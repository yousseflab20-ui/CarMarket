import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

interface User {
    id: string;
    email: string;
    role: string;
    name: string;
    photo: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => Promise<void>;
    logout: () => Promise<void>;
    initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,

    setAuth: async (user, token) => {
        set({ user, token, isAuthenticated: true });
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
    },

    logout: async () => {
        try {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            set({ user: null, token: null, isAuthenticated: false });
            setTimeout(() => {
                router.replace('/HomeScreen');
            }, 100);

            console.log('✅ Logged out successfully');
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
                set({ user, token, isAuthenticated: true });
                console.log('✅ Auth initialized:', user.email);
            } else {
                console.log('ℹ️ No saved auth found');
            }
        } catch (error) {
            console.error('❌ Failed to load auth from storage:', error);
        }
    },
}));
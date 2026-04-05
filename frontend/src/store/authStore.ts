import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import API from '../service/api';
import { User } from '../types/user';
import { AuthState } from '../types/store/auth';


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

    refreshProfile: async () => {
        try {
            const response = await API.get('/auth/profile');
            if (response.data && response.data.add) {
                const updatedUser = response.data.add;
                set({ user: updatedUser });
                await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
                console.log('✅ Profile refreshed');
            }
        } catch (error) {
            console.error('❌ Profile refresh error:', error);
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
import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useOnboardingStore } from '../store/onboardingStore';
import { ActivityIndicator, View } from 'react-native';
import { useEffect } from 'react';

export default function Index() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isInitialized = useAuthStore((state) => state.isInitialized);
    const user = useAuthStore((state) => state.user);

    const hasCompletedOnboarding = useOnboardingStore((state) => state.hasCompletedOnboarding);
    const isOnboardingLoading = useOnboardingStore((state) => state.isLoading);
    const loadOnboardingStatus = useOnboardingStore((state) => state.loadOnboardingStatus);

    useEffect(() => {
        loadOnboardingStatus();
    }, []);

    if (!isInitialized || isOnboardingLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B0E14' }}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    if (isAuthenticated) {
        if (user?.role === 'ADMIN') {
            return <Redirect href="/admin/HomeScreenAdmin" />;
        }
        return <Redirect href="/CarScreen" />;
    }

    if (hasCompletedOnboarding) {
        return <Redirect href="/onboarding/OnboardingTakePhoto" />;
    }

    return <Redirect href="/onboarding/OnboardingTakePhoto" />;
}
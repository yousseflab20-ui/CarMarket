import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../store/authStore';

// #region agent log
const LOG = (msg: string, data: Record<string, unknown>) => { fetch('http://127.0.0.1:7243/ingest/a0ca2142-c491-4f76-8acc-6278f4d17c30', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'index.tsx', message: msg, data, timestamp: Date.now() }) }).catch(() => { }); };
// #endregion

export default function Index() {
    const renderCount = useRef(0);
    renderCount.current += 1;
    const { isAuthenticated, user, isInitialized } = useAuthStore();
    // #region agent log
    LOG('Index render', { render: renderCount.current, isInitialized, isAuth: isAuthenticated, role: user?.role, hypothesisId: 'H1' });
    // #endregion

    useEffect(() => {
        if (!isInitialized) return;
        // #region agent log
        LOG('Index useEffect navigate', { isAuth: isAuthenticated, role: user?.role, hypothesisId: 'H1' });
        // #endregion

        // Add a small delay to prevent navigation before the root layout is mounted
        const timer = setTimeout(() => {
            if (isAuthenticated) {
                if (user?.role === 'ADMIN') {
                    router.replace("/admin/HomeScreenAdmin");
                } else {
                    router.replace("/(tab)/CarScreen");
                }
            } else {
                router.replace("/HomeScreen");
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [isInitialized, isAuthenticated, user?.role]);

    return <View style={{ flex: 1 }} />;
}

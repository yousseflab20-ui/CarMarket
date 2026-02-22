import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function Index() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);

    if (isAuthenticated) {
        if (user?.role === 'ADMIN') {
            return <Redirect href="/admin/HomeScreenAdmin" />;
        }
        return <Redirect href="/CarScreen" />;
    }

    return <Redirect href="/HomeScreen" />;
}
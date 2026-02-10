import { useQuery } from '@tanstack/react-query';
import { getAllCars } from './api';
import { useAuthStore } from '../../store/authStore';

export const useCarsQuery = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    return useQuery({
        queryKey: ['cars'],
        queryFn: getAllCars,
        enabled: isAuthenticated,
    });
};
import { useQuery } from '@tanstack/react-query';
import { getBuyerNegotiations, getSellerNegotiations } from './api';
import { useAuthStore } from '../../store/authStore';

export const useBuyerNegotiationsQuery = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    return useQuery({
        queryKey: ['buyerNegotiations'],
        queryFn: getBuyerNegotiations,
        enabled: isAuthenticated,
    });
};

export const useSellerNegotiationsQuery = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    return useQuery({
        queryKey: ['sellerNegotiations'],
        queryFn: getSellerNegotiations,
        enabled: isAuthenticated,
    });
};

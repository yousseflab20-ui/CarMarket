import { useQuery } from '@tanstack/react-query';
import { getBuyerNegotiations, getSellerNegotiations, getNegotiationById } from './api';
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

export const useNegotiationByIdQuery = (id: number | string | null | undefined) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    return useQuery({
        queryKey: ['negotiation', id ? String(id) : null],
        queryFn: () => getNegotiationById(id!),
        enabled: isAuthenticated && !!id,
    });
};

export const useNegotiationQuery = useNegotiationByIdQuery;



import { useQuery } from '@tanstack/react-query';
import { getBuyerOrders, getSellerOrders } from './api';

export const useSellerOrdersQuery = () => {
    return useQuery({
        queryKey: ['orders', 'seller'],
        queryFn: getSellerOrders,
    });
};

export const useBuyerOrdersQuery = () => {
    return useQuery({
        queryKey: ['orders', 'buyer'],
        queryFn: getBuyerOrders,
    });
};

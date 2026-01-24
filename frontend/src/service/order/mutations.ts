
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { acceptOrder, createOrder, rejectOrder } from './api';

export const useCreateOrderMutation = () => {
    return useMutation({
        mutationFn: ({ carId, message }: { carId: number; message: string }) => createOrder(carId, message),
    });
};

export const useAcceptOrderMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: acceptOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    });
};

export const useRejectOrderMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: rejectOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    });
};

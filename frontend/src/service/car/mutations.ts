import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addCar, markCarAsSold } from './api';

export const useAddCarMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addCar,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cars'] });
        },
    });
};

export const useMarkCarAsSoldMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (carId: number) => markCarAsSold(carId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cars'] });
            queryClient.invalidateQueries({ queryKey: ['AllCar'] });
        },
    });
};
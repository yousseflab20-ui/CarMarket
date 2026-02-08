import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addCar } from './api';

export const useAddCarMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addCar,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cars'] });
        },
    });
};
import { useQuery } from '@tanstack/react-query';
import { getAllCars } from './api';

export const useCarsQuery = () => {
    return useQuery({
        queryKey: ['cars'],

        queryFn: getAllCars,
    });
};
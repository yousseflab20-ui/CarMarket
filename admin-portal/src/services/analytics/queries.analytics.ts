import { useQuery } from '@tanstack/react-query';
import { fetchAnalytics } from './endpoint.analytics';

export interface UserPerMonth {
    month: string;
    count: string;
}

export interface CityActivity {
    city: string;
    count: string;
}

export interface AnalyticsData {
    success: boolean;
    newUsersPerMonth: UserPerMonth[];
    mostActiveCities: CityActivity[];
}

export const useAnalytics = () => {
    return useQuery<AnalyticsData>({
        queryKey: ['admin-analytics'],
        queryFn: fetchAnalytics,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });
};

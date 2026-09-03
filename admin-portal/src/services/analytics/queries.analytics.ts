import { useQuery } from "@tanstack/react-query";
import { getAnalytics } from "./endpoint.analytics";

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
    queryKey: ["admin-analytics"],
    queryFn: getAnalytics,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};

/**
 * React Query hook for home summary data
 */

import { useQuery } from '@tanstack/react-query';
import { getHomeSummary } from '../api/edgeFunctions';
import { useAuth } from '../contexts/AuthContext';

export function useHomeSummary() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['homeSummary', user?.id],
    queryFn: () => getHomeSummary(user!.id),
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds for live data
  });
}


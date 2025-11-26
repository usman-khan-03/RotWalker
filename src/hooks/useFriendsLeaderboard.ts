/**
 * React Query hook for friends leaderboard
 */

import { useQuery } from '@tanstack/react-query';
import { getFriendsLeaderboard } from '../api/edgeFunctions';
import { useAuth } from '../contexts/AuthContext';
import type { LeaderboardPeriod } from '../types';

export function useFriendsLeaderboard(period: LeaderboardPeriod = 'week') {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['friendsLeaderboard', user?.id, period],
    queryFn: () => getFriendsLeaderboard(user!.id, period),
    enabled: !!user,
    refetchInterval: 60000, // Refetch every minute
  });
}


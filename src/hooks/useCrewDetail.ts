/**
 * React Query hook for crew detail
 */

import { useQuery } from '@tanstack/react-query';
import { getCrewDetail } from '../api/edgeFunctions';

export function useCrewDetail(crewId: string | null) {
  return useQuery({
    queryKey: ['crewDetail', crewId],
    queryFn: () => getCrewDetail(crewId!),
    enabled: !!crewId,
  });
}


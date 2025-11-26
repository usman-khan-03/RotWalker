/**
 * Edge Function API wrappers
 * These are stubs that call Supabase Edge Functions
 * TODO: Replace with actual Edge Function endpoints once deployed
 */

import { supabase } from './supabase';
import type { StepSample, HomeSummary, FriendsLeaderboardEntry, CrewDetail, LeaderboardPeriod } from '../types';

/**
 * Sync steps data from device sensors or health apps
 * Edge Function: sync_steps_data
 */
export async function syncStepsData(
  userId: string,
  source: 'pedometer' | 'apple_health' | 'health_connect',
  samples: StepSample[]
): Promise<void> {
  // TODO: Replace with actual Edge Function call
  // const { error } = await supabase.functions.invoke('sync_steps_data', {
  //   body: { user_id: userId, source, samples },
  // });
  // if (error) throw error;

  // Mock implementation for now
  console.log('syncStepsData called', { userId, source, samples });
}

/**
 * Get home summary data
 * Edge Function: get_home_summary
 */
export async function getHomeSummary(userId: string): Promise<HomeSummary> {
  // TODO: Replace with actual Edge Function call
  // const { data, error } = await supabase.functions.invoke('get_home_summary', {
  //   body: { user_id: userId },
  // });
  // if (error) throw error;
  // return data;

  // Mock implementation for now
  return {
    today_steps: 0,
    week_steps: 0,
    streak: 0,
    primary_solo_journey: null,
    primary_crew_journey: null,
    current_season: null,
    previous_season: null,
    next_season: null,
  };
}

/**
 * Get friends leaderboard
 * Edge Function: get_friends_leaderboard
 */
export async function getFriendsLeaderboard(
  userId: string,
  period: LeaderboardPeriod
): Promise<FriendsLeaderboardEntry[]> {
  // TODO: Replace with actual Edge Function call
  // const { data, error } = await supabase.functions.invoke('get_friends_leaderboard', {
  //   body: { user_id: userId, period },
  // });
  // if (error) throw error;
  // return data;

  // Mock implementation for now
  return [];
}

/**
 * Get crew detail
 * Edge Function: get_crew_detail
 */
export async function getCrewDetail(crewId: string): Promise<CrewDetail> {
  // TODO: Replace with actual Edge Function call
  // const { data, error } = await supabase.functions.invoke('get_crew_detail', {
  //   body: { crew_id: crewId },
  // });
  // if (error) throw error;
  // return data;

  // Mock implementation - will throw error for now
  throw new Error('Crew not found');
}


/**
 * TypeScript types for RotWalker entities
 */

export type Units = 'metric' | 'imperial';

export type JourneyType = 'solo' | 'crew';

export type JourneyStatus = 'active' | 'completed' | 'expired';

export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';

export type CrewMemberRole = 'owner' | 'admin' | 'member';

export type CrewMemberStatus = 'active' | 'invited' | 'left' | 'kicked';

export type SeasonStatus = 'upcoming' | 'active' | 'ended';

export type StepSource = 'pedometer' | 'apple_health' | 'health_connect';

export type LeaderboardPeriod = 'today' | 'week' | 'month';

export interface Profile {
  id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
  country: string | null;
  city: string | null;
  units: Units;
  is_onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: FriendshipStatus;
  requested_by: string;
  created_at: string;
  updated_at: string;
}

export interface Crew {
  id: string;
  name: string;
  emoji: string;
  owner_id: string;
  origin_city: string | null;
  origin_lat: number | null;
  origin_lng: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CrewMember {
  id: string;
  crew_id: string;
  user_id: string;
  role: CrewMemberRole;
  status: CrewMemberStatus;
  created_at: string;
  updated_at: string;
}

export interface Journey {
  id: string;
  type: JourneyType;
  user_id: string | null;
  crew_id: string | null;
  name: string;
  origin_city: string;
  origin_lat: number;
  origin_lng: number;
  dest_city: string;
  dest_lat: number;
  dest_lng: number;
  start_date: string;
  end_date: string | null;
  target_distance_km: number;
  status: JourneyStatus;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface JourneyProgress {
  id: string;
  journey_id: string;
  user_id: string;
  date: string;
  steps: number;
  distance_km: number;
  created_at: string;
  updated_at: string;
}

export interface DailySteps {
  id: string;
  user_id: string;
  date: string;
  steps: number;
  distance_km: number;
  source: StepSource;
  created_at: string;
  updated_at: string;
}

export interface Season {
  id: string;
  week_start: string;
  week_end: string;
  origin_city: string;
  origin_lat: number;
  origin_lng: number;
  dest_city: string;
  dest_lat: number;
  dest_lng: number;
  target_distance_km: number;
  status: SeasonStatus;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

export interface SeasonCrew {
  id: string;
  season_id: string;
  crew_id: string;
  opponent_crew_id: string | null;
  opted_in: boolean;
  total_distance_km: number;
  rank: number | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  payload: Record<string, any>;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface HomeSummary {
  today_steps: number;
  week_steps: number;
  streak: number;
  primary_solo_journey: JourneyWithProgress | null;
  primary_crew_journey: JourneyWithProgress | null;
  current_season: SeasonInfo | null;
  previous_season: SeasonInfo | null;
  next_season: SeasonInfo | null;
}

export interface JourneyWithProgress extends Journey {
  distance_travelled_km: number;
  progress_ratio: number;
  steps_contributed: number;
}

export interface SeasonInfo {
  season: Season;
  user_crew: SeasonCrewWithCrew | null;
  opponent_crew: SeasonCrewWithCrew | null;
  global_leaderboard: SeasonCrewWithCrew[];
}

export interface SeasonCrewWithCrew extends SeasonCrew {
  crew: Crew;
}

export interface FriendsLeaderboardEntry {
  friend: Profile;
  steps: number;
  distance_km: number;
  primary_journey_progress: number | null;
  primary_journey_name: string | null;
}

export interface CrewDetail {
  crew: Crew;
  members: (CrewMember & { profile: Profile; contribution_steps: number; contribution_distance_km: number })[];
  current_journey: JourneyWithProgress | null;
  season_participation: SeasonCrewWithCrew | null;
}

export interface StepSample {
  date: string;
  steps: number;
  distance_m?: number;
}


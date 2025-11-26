/**
 * Direct Supabase database queries
 * Use these for simple CRUD operations
 */

import { supabase } from './supabase';
import type { Profile, Crew, Journey, CrewMember, Season, SeasonCrew } from '../types';

// Profile queries
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return data;
}

export async function createProfile(profile: Partial<Profile>): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Crew queries
export async function getUserCrews(userId: string): Promise<Crew[]> {
  const { data, error } = await supabase
    .from('crew_members')
    .select('crew:crews(*)')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (error) throw error;
  return data.map((item: any) => item.crew).filter(Boolean);
}

export async function createCrew(crew: Partial<Crew>): Promise<Crew> {
  const { data, error } = await supabase
    .from('crews')
    .insert(crew)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Journey queries
export async function getUserJourneys(userId: string, type: 'solo' | 'crew'): Promise<Journey[]> {
  const query = supabase
    .from('journeys')
    .select('*')
    .eq('type', type)
    .eq('status', 'active');

  if (type === 'solo') {
    query.eq('user_id', userId);
  } else {
    // For crew journeys, get via crew_members
    const { data: crewMembers } = await supabase
      .from('crew_members')
      .select('crew_id')
      .eq('user_id', userId)
      .eq('status', 'active');

    const crewIds = crewMembers?.map(cm => cm.crew_id) || [];
    if (crewIds.length === 0) return [];
    query.in('crew_id', crewIds);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createJourney(journey: Partial<Journey>): Promise<Journey> {
  const { data, error } = await supabase
    .from('journeys')
    .insert(journey)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Season queries
export async function getCurrentSeason(): Promise<Season | null> {
  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .eq('is_current', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
}

export async function getSeasonCrews(seasonId: string): Promise<SeasonCrew[]> {
  const { data, error } = await supabase
    .from('season_crews')
    .select('*')
    .eq('season_id', seasonId)
    .order('total_distance_km', { ascending: false });

  if (error) throw error;
  return data || [];
}


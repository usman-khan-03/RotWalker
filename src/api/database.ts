/**
 * Direct Supabase database queries
 * Use these for simple CRUD operations
 */

import { supabase } from './supabase';
import type { Profile, Crew, Journey, CrewMember, Season, SeasonCrew } from '../types';

// Profile queries
export async function getProfile(userId: string): Promise<Profile | null> {
  console.log("inside get profile with userId:", userId);
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    console.log("finished with supabase query for getProfile");
    if (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }

    if (!data) {
      console.log('Profile not found for user:', userId);
      return null;
    }

    console.log('Fetched profile:', data);
    return data;
  } catch (error: any) {
    console.error('Exception in getProfile:', error.message);
    throw error;
  }
}

export async function createProfile(profile: Partial<Profile>): Promise<Profile> {
  try {
    const queryPromise = supabase
      .from('profiles')
      .insert(profile)
      .select()
      .maybeSingle();

    // Wrap with timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Insert query timeout after 5s')), 5000)
    );

    const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

    if (error) {
      console.error('Error creating profile:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Failed to create profile');
    }

    console.log('Created new profile:', data);
    return data;
  } catch (error: any) {
    console.error('Exception in createProfile:', error.message);
    throw error;
  }
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
  console.log("Updating profile for user:", userId, "with updates:", updates);
  
  try {
    // First, do the update without select to avoid hanging
    const updateQuery = supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .throwOnError();

    // Wrap with timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Update query timeout after 5s')), 5000)
    );

    await Promise.race([updateQuery, timeoutPromise]);

    console.log("Update query completed, now fetching updated profile");
    
    // Now fetch the updated profile
    const updatedProfile = await getProfile(userId);
    
    if (!updatedProfile) {
      throw new Error('Failed to fetch updated profile');
    }

    console.log('Updated profile:', updatedProfile);
    return updatedProfile;
  } catch (error: any) {
    console.error('Exception in updateProfile:', error.message);
    throw error;
  }
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


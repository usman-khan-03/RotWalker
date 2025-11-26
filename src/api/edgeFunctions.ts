/**
 * Edge Function API wrappers
 * These are stubs that call Supabase Edge Functions
 */

import { supabase } from "./supabase";
import type {
	StepSample,
	HomeSummary,
	FriendsLeaderboardEntry,
	CrewDetail,
	LeaderboardPeriod,
} from "../types";

/**
 * Sync steps data from device sensors or health apps
 * Edge Function: sync_steps_data
 */
export async function syncStepsData(
	userId: string,
	source: "pedometer" | "apple_health" | "health_connect",
	samples: StepSample[],
): Promise<void> {
	try {
		const { data, error } = await supabase.functions.invoke("sync_steps_data", {
			body: { user_id: userId, source, samples },
		});
		
		if (error) {
			console.error('Edge function error:', error);
			throw error;
		}
		
		return data;
	} catch (err: any) {
		// Log error but don't crash the app
		console.error('Error calling sync_steps_data edge function:', err);
		throw err;
	}
}

/**
 * Get home summary data
 * Edge Function: get_home_summary
 */
export async function getHomeSummary(userId: string): Promise<HomeSummary> {
	const { data, error } = await supabase.functions.invoke("get_home_summary", {
		body: { user_id: userId },
	});
	if (error) throw error;
	return data;
}

/**
 * Get friends leaderboard
 * Edge Function: get_friends_leaderboard
 */
export async function getFriendsLeaderboard(
	userId: string,
	period: LeaderboardPeriod,
): Promise<FriendsLeaderboardEntry[]> {
	const { data, error } = await supabase.functions.invoke(
		"get_friends_leaderboard",
		{
			body: { user_id: userId, period },
		},
	);
	if (error) throw error;
	return data;
}

/**
 * Get crew detail
 * Edge Function: get_crew_detail
 */
export async function getCrewDetail(crewId: string): Promise<CrewDetail> {
	const { data, error } = await supabase.functions.invoke("get_crew_detail", {
		body: { crew_id: crewId },
	});
	if (error) throw error;
	return data;
}

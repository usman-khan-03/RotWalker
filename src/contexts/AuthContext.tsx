/**
 * Auth Context for managing authentication state
 */

import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../api/supabase";
import { getProfile, createProfile } from "../api/database";
import type { Profile } from "../types";

interface AuthContextType {
	user: User | null;
	profile: Profile | null;
	session: Session | null;
	loading: boolean;
	signInWithGoogle: () => Promise<void>;
	signOut: () => Promise<void>;
	refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [profile, setProfile] = useState<Profile | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true);

	const fetchProfile = async (userId: string) => {
		try {
			let userProfile = await getProfile(userId);

			// Create profile if it doesn't exist
			if (!userProfile) {
				userProfile = await createProfile({
					id: userId,
					display_name:
						user?.user_metadata?.full_name ||
						user?.email?.split("@")[0] ||
						"User",
					username:
						user?.user_metadata?.preferred_username ||
						user?.email?.split("@")[0] ||
						`user_${userId.slice(0, 8)}`,
					avatar_url: user?.user_metadata?.avatar_url || null,
					units: "metric",
					is_onboarding_complete: false,
				});
			}

			setProfile(userProfile);
		} catch (error) {
			console.error("Error fetching profile:", error);
			setProfile(null);
		}
	};

	const refreshProfile = async () => {
		if (user) {
			await fetchProfile(user.id);
		}
	};

	useEffect(() => {
		// Get initial session
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
			setUser(session?.user ?? null);
			if (session?.user) {
				fetchProfile(session.user.id).finally(() => setLoading(false));
			} else {
				setLoading(false);
			}
		});

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (_event, session) => {
			setSession(session);
			setUser(session?.user ?? null);

			if (session?.user) {
				await fetchProfile(session.user.id);
			} else {
				setProfile(null);
			}

			setLoading(false);
		});

		return () => subscription.unsubscribe();
	}, []);

	const signInWithGoogle = async () => {
		// TODO: Implement Google Sign-In
		// This is a stub - replace with actual Google OAuth flow
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: "rotwalker://auth/callback",
			},
		});

		if (error) throw error;
		// Session will be updated via onAuthStateChange
	};

	const signOut = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) throw error;
		setUser(null);
		setProfile(null);
		setSession(null);
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				profile,
				session,
				loading,
				signInWithGoogle,
				signOut,
				refreshProfile,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}

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
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from "../api/supabase";
import { getProfile, createProfile } from "../api/database";
import type { Profile } from "../types";

// Complete auth session for proper OAuth handling
WebBrowser.maybeCompleteAuthSession();

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

		// Handle deep links for OAuth callback
		const handleDeepLink = async (url: string) => {
			// Extract the URL fragments/query params
			const { path, queryParams } = Linking.parse(url);
			
			if (path === 'auth/callback' || queryParams?.access_token) {
				// Handle the OAuth callback
				const accessToken = queryParams?.access_token as string;
				const refreshToken = queryParams?.refresh_token as string;
				
				if (accessToken && refreshToken) {
					const { data, error } = await supabase.auth.setSession({
						access_token: accessToken,
						refresh_token: refreshToken,
					});
					
					if (error) {
						console.error('Error setting session from deep link:', error);
					}
				}
			}
		};

		// Check if app was opened via deep link
		Linking.getInitialURL().then((url) => {
			if (url) {
				handleDeepLink(url);
			}
		});

		// Listen for deep links while app is running
		const subscriptionLinking = Linking.addEventListener('url', (event) => {
			handleDeepLink(event.url);
		});

		return () => {
			subscription.unsubscribe();
			subscriptionLinking.remove();
		};
	}, []);

	const signInWithGoogle = async () => {
		try {
			// Get the redirect URL - use the app scheme
			const redirectUrl = Linking.createURL('auth/callback');
			
			const { data, error } = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: {
					redirectTo: redirectUrl,
					skipBrowserRedirect: false,
				},
			});

			if (error) {
				console.error("Google OAuth error:", error);
				throw error;
			}

			// Open the OAuth URL in the browser
			if (data?.url) {
				const result = await WebBrowser.openAuthSessionAsync(
					data.url,
					redirectUrl
				);

				if (result.type === 'cancel') {
					throw new Error('Google sign-in was cancelled');
				}

				// The session will be set via the deep link handler
				// No need to manually extract tokens here
			}
		} catch (error: any) {
			console.error("Error in signInWithGoogle:", error);
			throw error;
		}
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

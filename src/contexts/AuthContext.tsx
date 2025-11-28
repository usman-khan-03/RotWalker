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
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
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

	// Handle deep links for OAuth callback
	const handleDeepLink = async (url: string) => {
		// Extract the URL fragments/query params
		const { path, queryParams } = Linking.parse(url);

		// Parse fragments from the URL (OAuth tokens come as fragments)
		const fragmentMatch = url.match(/#(.+)/);
		const fragment = fragmentMatch ? fragmentMatch[1] : "";
		const fragmentParams = new URLSearchParams(fragment);

		if (path === "auth/callback" || queryParams?.access_token || fragment) {
			// Handle the OAuth callback
			const accessToken =
				(queryParams?.access_token as string) ||
				fragmentParams.get("access_token");
			const refreshToken =
				(queryParams?.refresh_token as string) ||
				fragmentParams.get("refresh_token");

			// console.log("Parsed tokens from deep link:", {
			//   accessToken: !!accessToken,
			//   refreshToken: !!refreshToken,
			// });

			if (accessToken && refreshToken) {
				const { data, error } = await supabase.auth.setSession({
					access_token: accessToken,
					refresh_token: refreshToken,
				});

				if (error) {
					console.error("Error setting session from deep link:", error);
				} else {
					console.log("Session set successfully from deep link");
				}
			}
		}
	};

	const fetchProfile = async (userId: string) => {
		console.log("Fetching profile for user:", userId);
		try {
			let userProfile = await getProfile(userId);
			console.log("Fetched profile:", userProfile);

			// Create profile if it doesn't exist
			if (!userProfile) {
				console.log("No profile found, creating new profile for user:", userId);
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
				console.log(
					"Created new profile for user: - fetch profile",
					userProfile,
				);
			}

			console.log("Setting profile in context:", userProfile);
			setProfile(userProfile);
			console.log("Profile set in context successfully");
		} catch (error) {
			console.error("Error fetching profile:", error);
			setProfile(null);
		}
	};

	const refreshProfile = async () => {
		console.log("trying to refresh profile - auth context");
		if (user) {
			try {
				// Add small delay to allow database replication after updates
				await new Promise((resolve) => setTimeout(resolve, 1000));
				await fetchProfile(user.id);
			} catch (error) {
				console.error("Error refreshing profile:", error);
			}
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
				// Defer to next tick to avoid deadlock with auth state
				setTimeout(async () => {
					await fetchProfile(session.user.id);
				}, 0);
			} else {
				setProfile(null);
			}

			setLoading(false);
		});

		// Check if app was opened via deep link
		Linking.getInitialURL().then((url) => {
			if (url) {
				// console.log("Initial URL received:", url);
				handleDeepLink(url);
			}
		});

		// Listen for deep links while app is running
		const subscriptionLinking = Linking.addEventListener("url", (event) => {
			//   console.log("Deep link event received:", event.url);
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
			const redirectUrl = Linking.createURL("auth/callback", {
				scheme: "rotwalker",
			});
			console.log("redirect url: ", redirectUrl);

			const { data, error } = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: {
					redirectTo: redirectUrl,
					skipBrowserRedirect: true, // changed
				},
			});

			if (error) {
				console.error("Google OAuth error:", error);
				throw error;
			}

			// required to make ios auth session work - cleans up auth session and redirects
			WebBrowser.maybeCompleteAuthSession();

			// Open the OAuth URL in the browser
			if (data?.url) {
				const result = await WebBrowser.openAuthSessionAsync(
					data.url,
					redirectUrl,
				);

				if (result.type === "cancel") {
					throw new Error("Google sign-in was cancelled");
				}

				if (result.type === "success" && result.url) {
					await handleDeepLink(result.url);
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

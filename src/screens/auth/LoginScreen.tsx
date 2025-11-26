/**
 * Login Screen - Google Sign-In
 */

import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ActivityIndicator,
	Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAuth } from "../../contexts/AuthContext";
import { theme } from "../../theme/theme";
import { AuthStackParamList } from "../../navigation/AuthStack";

type LoginScreenNavigationProp = StackNavigationProp<
	AuthStackParamList,
	"Login"
>;

export function LoginScreen() {
	const navigation = useNavigation<LoginScreenNavigationProp>();
	const { signInWithGoogle } = useAuth();
	const [loading, setLoading] = useState(false);

	const handleGoogleSignIn = async () => {
		try {
			setLoading(true);
			await signInWithGoogle();
			console.log("Sign in was successful?");
			// Navigation will happen automatically via auth state change
		} catch (error: any) {
			Alert.alert(
				"Sign In Error",
				error.message || "Failed to sign in with Google",
			);
			setLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<View style={styles.content}>
				<Text style={styles.title}>Sign In</Text>
				<Text style={styles.subtitle}>Continue with your Google account</Text>
			</View>

			<View style={styles.footer}>
				<TouchableOpacity
					style={[styles.button, loading && styles.buttonDisabled]}
					onPress={handleGoogleSignIn}
					disabled={loading}
					activeOpacity={0.8}
				>
					{loading ? (
						<ActivityIndicator color={theme.colors.white} />
					) : (
						<Text style={styles.buttonText}>Continue with Google</Text>
					)}
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.backButton}
					onPress={() => navigation.goBack()}
					disabled={loading}
				>
					<Text style={styles.backButtonText}>Back</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.background,
		justifyContent: "space-between",
		padding: theme.spacing.xl,
	},
	content: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	title: {
		...theme.typography.h1,
		marginBottom: theme.spacing.sm,
		textAlign: "center",
	},
	subtitle: {
		...theme.typography.bodySecondary,
		textAlign: "center",
	},
	footer: {
		paddingBottom: theme.spacing.xl,
	},
	button: {
		backgroundColor: theme.colors.solo.primary,
		borderRadius: theme.borderRadius.pill,
		paddingVertical: theme.spacing.md,
		paddingHorizontal: theme.spacing.xl,
		alignItems: "center",
		marginBottom: theme.spacing.md,
		...theme.shadows.button,
	},
	buttonDisabled: {
		opacity: 0.6,
	},
	buttonText: {
		...theme.typography.body,
		color: theme.colors.white,
		fontWeight: "600",
	},
	backButton: {
		paddingVertical: theme.spacing.sm,
		alignItems: "center",
	},
	backButtonText: {
		...theme.typography.body,
		color: theme.colors.textSecondary,
	},
});

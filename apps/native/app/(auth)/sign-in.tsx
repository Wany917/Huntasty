import { Ionicons } from "@expo/vector-icons";
import { useForm } from "@tanstack/react-form";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	View,
} from "react-native";
import { StyleSheet } from "react-native-unistyles";
import z from "zod";

import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/trpc";

const signInSchema = z.object({
	email: z
		.string()
		.trim()
		.min(1, "Email is required")
		.email("Enter a valid email address"),
	password: z
		.string()
		.min(1, "Password is required")
		.min(8, "Use at least 8 characters"),
});

export default function SignInScreen() {
	const [error, setError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: { email: "", password: "" },
		validators: { onSubmit: signInSchema },
		onSubmit: async ({ value, formApi }) => {
			await authClient.signIn.email(
				{
					email: value.email.trim(),
					password: value.password,
				},
				{
					onError(err) {
						setError(err.error?.message || "Failed to sign in");
					},
					onSuccess() {
						setError(null);
						formApi.reset();
						queryClient.refetchQueries();
						router.replace("/(tabs)");
					},
				},
			);
		},
	});

	return (
		<KeyboardAvoidingView
			style={styles.flex}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<ScrollView
				contentContainerStyle={styles.container}
				keyboardShouldPersistTaps="handled"
			>
				{/* Form section */}
				<form.Subscribe
					selector={(state) => ({
						isSubmitting: state.isSubmitting,
					})}
				>
					{({ isSubmitting }) => (
						<View style={styles.form}>
							{error && (
								<View style={styles.errorBox}>
									<Text style={styles.errorText}>{error}</Text>
								</View>
							)}

							<form.Field name="email">
								{(field) => (
									<Input
										label="Email Address"
										leftIcon="mail-outline"
										placeholder="Enter Email Address"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChangeText={(v) => {
											field.handleChange(v);
											if (error) setError(null);
										}}
										keyboardType="email-address"
										autoCapitalize="none"
										autoComplete="email"
									/>
								)}
							</form.Field>

							<form.Field name="password">
								{(field) => (
									<Input
										label="Password"
										leftIcon="lock-closed-outline"
										placeholder="Enter Password"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChangeText={(v) => {
											field.handleChange(v);
											if (error) setError(null);
										}}
										secureTextEntry
										autoComplete="password"
										onSubmitEditing={form.handleSubmit}
									/>
								)}
							</form.Field>

							<Button
								variant="primary"
								size="lg"
								loading={isSubmitting}
								onPress={form.handleSubmit}
							>
								Login
							</Button>

							<Pressable style={styles.forgotBtn}>
								<Text variant="label" style={styles.forgotText}>
									Forgot password?
								</Text>
							</Pressable>
						</View>
					)}
				</form.Subscribe>

				{/* Social login section — pushed to bottom */}
				<View style={styles.socialSection}>
					<View style={styles.dividerRow}>
						<Divider />
						<Text variant="bodySm" style={styles.dividerText}>
							or continue with
						</Text>
						<Divider />
					</View>

					<Button
						variant="google"
						size="lg"
						icon={<Ionicons name="logo-google" size={20} color="#FFFFFF" />}
					>
						Login with Google
					</Button>

					<Button
						variant="apple"
						size="lg"
						icon={<Ionicons name="logo-apple" size={20} color="#FFFFFF" />}
					>
						Login with Apple
					</Button>
				</View>

				<View style={styles.footer}>
					<Text variant="bodySm" style={styles.footerText}>
						Don't have an account?{" "}
					</Text>
					<Link href="/(auth)/sign-up">
						<Text variant="label" style={styles.link}>
							Create New Account
						</Text>
					</Link>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create((theme) => ({
	flex: {
		flex: 1,
		backgroundColor: theme.colors.surface,
	},
	container: {
		flexGrow: 1,
		padding: theme.spacing.lg,
		justifyContent: "space-between",
	},
	form: {
		gap: theme.spacing.md,
		marginTop: theme.spacing.md,
	},
	errorBox: {
		padding: theme.spacing.sm,
		backgroundColor: `${theme.colors.destructive}15`,
		borderRadius: theme.borderRadius.xl,
	},
	errorText: {
		color: theme.colors.destructive,
		fontSize: theme.fontSize.sm,
	},
	forgotBtn: {
		alignSelf: "center",
		paddingVertical: theme.spacing.sm,
	},
	forgotText: {
		color: theme.colors.foreground,
		fontFamily: theme.fonts.bold,
	},
	socialSection: {
		gap: theme.spacing.md,
		marginTop: theme.spacing.xxl,
	},
	dividerRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: theme.spacing.md,
	},
	dividerText: {
		color: theme.colors.mutedForeground,
		flexShrink: 0,
	},
	footer: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		marginTop: theme.spacing.lg,
		paddingBottom: theme.spacing.md,
	},
	footerText: {
		color: theme.colors.mutedForeground,
	},
	link: {
		color: theme.colors.secondary, // teal
	},
}));

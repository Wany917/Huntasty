import { useForm } from "@tanstack/react-form";
import { Link, router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/trpc";

const signUpSchema = z.object({
	username: z
		.string()
		.trim()
		.min(1, "Username is required")
		.min(3, "Use at least 3 characters")
		.max(20, "Max 20 characters")
		.regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers and _ only"),
	firstName: z.string().trim().min(1, "First name is required"),
	lastName: z.string().trim().min(1, "Last name is required"),
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

export default function SignUpScreen() {
	const [error, setError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			username: "",
			firstName: "",
			lastName: "",
			email: "",
			password: "",
		},
		validators: { onSubmit: signUpSchema },
		onSubmit: async ({ value, formApi }) => {
			const fullName = `${value.firstName.trim()} ${value.lastName.trim()}`;
			await authClient.signUp.email(
				{
					name: fullName,
					email: value.email.trim(),
					password: value.password,
					// username sent via additional fields if auth config supports it
				},
				{
					onError(err) {
						setError(err.error?.message || "Failed to create account");
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

	const clearError = () => {
		if (error) setError(null);
	};

	return (
		<KeyboardAvoidingView
			style={styles.flex}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<ScrollView
				contentContainerStyle={styles.container}
				keyboardShouldPersistTaps="handled"
			>
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

							<form.Field name="username">
								{(field) => (
									<Input
										label="Username"
										leftIcon="person-outline"
										placeholder="Username"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChangeText={(v) => {
											field.handleChange(v);
											clearError();
										}}
										autoCapitalize="none"
										autoComplete="username"
									/>
								)}
							</form.Field>

							{/* First Name / Last Name — side by side */}
							<View style={styles.nameRow}>
								<View style={styles.nameField}>
									<form.Field name="firstName">
										{(field) => (
											<Input
												label="First Name"
												leftIcon="person-outline"
												placeholder="First Name"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChangeText={(v) => {
													field.handleChange(v);
													clearError();
												}}
												autoComplete="given-name"
											/>
										)}
									</form.Field>
								</View>
								<View style={styles.nameField}>
									<form.Field name="lastName">
										{(field) => (
											<Input
												label="Last Name"
												leftIcon="person-outline"
												placeholder="Last Name"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChangeText={(v) => {
													field.handleChange(v);
													clearError();
												}}
												autoComplete="family-name"
											/>
										)}
									</form.Field>
								</View>
							</View>

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
											clearError();
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
											clearError();
										}}
										secureTextEntry
										autoComplete="new-password"
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
								Continue
							</Button>

							<Text variant="bodySm" style={styles.terms}>
								By continuing, you agree to the{" "}
								<Text variant="label" style={styles.termsLink}>
									Terms of Services
								</Text>
								{" & "}
								<Text variant="label" style={styles.termsLink}>
									Privacy Policy
								</Text>
							</Text>
						</View>
					)}
				</form.Subscribe>

				<View style={styles.footer}>
					<Text variant="bodySm" style={styles.footerText}>
						Already have an account?{" "}
					</Text>
					<Link href="/(auth)/sign-in">
						<Text variant="label" style={styles.link}>
							Sign In
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
	nameRow: {
		flexDirection: "row",
		gap: theme.spacing.md,
	},
	nameField: {
		flex: 1,
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
	terms: {
		textAlign: "center",
		color: theme.colors.mutedForeground,
		lineHeight: theme.lineHeight.sm,
	},
	termsLink: {
		color: theme.colors.foreground,
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
		color: theme.colors.secondary,
	},
}));

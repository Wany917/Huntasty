import {
	ActivityIndicator,
	Pressable,
	type PressableProps,
} from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "./text";

type ButtonVariant =
	| "primary"
	| "secondary"
	| "outline"
	| "ghost"
	| "destructive"
	| "google"
	| "apple";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<PressableProps, "children"> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	loading?: boolean;
	icon?: React.ReactNode;
	children: string;
}

export function Button({
	variant = "primary",
	size = "md",
	loading = false,
	icon,
	children,
	disabled,
	style,
	...props
}: ButtonProps) {
	const isDisabled = disabled || loading;

	return (
		<Pressable
			style={(state) => [
				styles.base,
				styles[variant],
				styles[`size_${size}`],
				state.pressed && styles.pressed,
				isDisabled && styles.disabled,
				typeof style === "function" ? style(state) : style,
			]}
			disabled={isDisabled}
			{...props}
		>
			{loading ? (
				<ActivityIndicator
					size="small"
					color={
						variant === "outline" || variant === "ghost"
							? styles.outlineText.color
							: styles.primaryText.color
					}
				/>
			) : (
				<>
					{icon}
					<Text
						style={[
							styles.text,
							styles[`${variant}Text`],
							styles[`text_${size}`],
						]}
					>
						{children}
					</Text>
				</>
			)}
		</Pressable>
	);
}

const styles = StyleSheet.create((theme) => ({
	base: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		borderRadius: theme.borderRadius.xl, // Figma: 16px
		gap: theme.spacing.sm,
	},
	pressed: {
		opacity: 0.85,
	},
	disabled: {
		opacity: 0.5,
	},
	// Variants — Figma: Primary=#042628, Secondary=#70B9BE
	primary: {
		backgroundColor: theme.colors.primary, // navy in light, teal in dark
	},
	secondary: {
		backgroundColor: theme.colors.secondary, // teal
	},
	outline: {
		backgroundColor: "transparent",
		borderWidth: 1.5,
		borderColor: theme.colors.border,
	},
	ghost: {
		backgroundColor: "transparent",
	},
	destructive: {
		backgroundColor: theme.colors.destructive,
	},
	google: {
		backgroundColor: theme.colors.google, // coral #E86143
	},
	apple: {
		backgroundColor: theme.colors.apple, // black
	},
	// Sizes — Figma button h=54 → py=16 for lg
	size_sm: {
		paddingVertical: theme.spacing.xs + 2,
		paddingHorizontal: theme.spacing.md,
	},
	size_md: {
		paddingVertical: theme.spacing.sm + 4,
		paddingHorizontal: theme.spacing.lg,
	},
	size_lg: {
		height: 54, // Figma exact height
		paddingHorizontal: theme.spacing.xl,
	},
	// Text — Figma: Sofia Pro Bold 16px
	text: {
		fontFamily: theme.fonts.bold,
	},
	text_sm: {
		fontSize: theme.fontSize.sm,
	},
	text_md: {
		fontSize: theme.fontSize.base,
	},
	text_lg: {
		fontSize: theme.fontSize.base, // Figma: 16px even for large buttons
	},
	primaryText: {
		color: theme.colors.primaryForeground,
	},
	secondaryText: {
		color: theme.colors.secondaryForeground,
	},
	outlineText: {
		color: theme.colors.foreground,
	},
	ghostText: {
		color: theme.colors.foreground,
	},
	destructiveText: {
		color: theme.colors.destructiveForeground,
	},
	googleText: {
		color: "#FFFFFF",
	},
	appleText: {
		color: "#FFFFFF",
	},
}));

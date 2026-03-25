import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "./text";

type BadgeVariant = "default" | "success" | "warning" | "destructive" | "level";

interface BadgeProps {
	variant?: BadgeVariant;
	children: string;
}

export function Badge({ variant = "default", children }: BadgeProps) {
	return (
		<View style={[styles.base, styles[variant]]}>
			<Text style={[styles.text, styles[`${variant}Text`]]}>{children}</Text>
		</View>
	);
}

const styles = StyleSheet.create((theme) => ({
	base: {
		alignSelf: "flex-start",
		paddingHorizontal: theme.spacing.sm,
		paddingVertical: theme.spacing["2xs"],
		borderRadius: theme.borderRadius.full,
	},
	text: {
		fontSize: theme.fontSize.xs,
		fontFamily: theme.fonts.medium,
	},
	default: {
		backgroundColor: theme.colors.muted,
	},
	defaultText: {
		color: theme.colors.mutedForeground,
	},
	success: {
		backgroundColor: `${theme.colors.success}20`,
	},
	successText: {
		color: theme.colors.success,
	},
	warning: {
		backgroundColor: `${theme.colors.warning}20`,
	},
	warningText: {
		color: theme.colors.warning,
	},
	destructive: {
		backgroundColor: `${theme.colors.destructive}20`,
	},
	destructiveText: {
		color: theme.colors.destructive,
	},
	level: {
		backgroundColor: `${theme.colors.brand}20`,
	},
	levelText: {
		color: theme.colors.brandDark,
	},
}));

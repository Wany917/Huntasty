import { Text as RNText, type TextProps as RNTextProps } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type TextVariant =
	| "h1"
	| "h2"
	| "h3"
	| "body"
	| "bodyLg"
	| "bodySm"
	| "caption"
	| "label";

interface TextProps extends RNTextProps {
	variant?: TextVariant;
}

export function Text({ variant = "body", style, ...props }: TextProps) {
	return <RNText style={[styles.base, styles[variant], style]} {...props} />;
}

const styles = StyleSheet.create((theme) => ({
	base: {
		color: theme.colors.foreground,
		fontFamily: theme.fonts.regular,
	},
	h1: {
		fontSize: theme.fontSize["4xl"],
		lineHeight: theme.lineHeight["4xl"],
		fontFamily: theme.fonts.bold,
	},
	h2: {
		fontSize: theme.fontSize["2xl"],
		lineHeight: theme.lineHeight["2xl"],
		fontFamily: theme.fonts.bold,
	},
	h3: {
		fontSize: theme.fontSize.xl,
		lineHeight: theme.lineHeight.xl,
		fontFamily: theme.fonts.semiBold,
	},
	body: {
		fontSize: theme.fontSize.base,
		lineHeight: theme.lineHeight.base,
	},
	bodyLg: {
		fontSize: theme.fontSize.lg,
		lineHeight: theme.lineHeight.lg,
	},
	bodySm: {
		fontSize: theme.fontSize.sm,
		lineHeight: theme.lineHeight.sm,
	},
	caption: {
		fontSize: theme.fontSize.xs,
		lineHeight: theme.lineHeight.xs,
		color: theme.colors.mutedForeground,
	},
	label: {
		fontSize: theme.fontSize.sm,
		lineHeight: theme.lineHeight.sm,
		fontFamily: theme.fonts.medium,
	},
}));

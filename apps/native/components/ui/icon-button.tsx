import { Ionicons } from "@expo/vector-icons";
import { Pressable, type PressableProps } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type IconButtonVariant = "default" | "primary" | "ghost";
type IconButtonSize = "sm" | "md" | "lg";

interface IconButtonProps extends Omit<PressableProps, "children"> {
	icon: React.ComponentProps<typeof Ionicons>["name"];
	variant?: IconButtonVariant;
	size?: IconButtonSize;
	color?: string;
}

const ICON_SIZES: Record<IconButtonSize, number> = {
	sm: 18,
	md: 22,
	lg: 28,
};

export function IconButton({
	icon,
	variant = "default",
	size = "md",
	color,
	style,
	...props
}: IconButtonProps) {
	return (
		<Pressable
			style={(state) => [
				styles.base,
				styles[variant],
				styles[`size_${size}`],
				state.pressed && styles.pressed,
				typeof style === "function" ? style(state) : style,
			]}
			{...props}
		>
			<Ionicons
				name={icon}
				size={ICON_SIZES[size]}
				color={color ?? styles[`${variant}Icon`].color}
			/>
		</Pressable>
	);
}

const styles = StyleSheet.create((theme) => ({
	base: {
		alignItems: "center",
		justifyContent: "center",
		borderRadius: theme.borderRadius.full,
	},
	pressed: {
		opacity: 0.7,
	},
	// Variants
	default: {
		backgroundColor: theme.colors.muted,
	},
	primary: {
		backgroundColor: theme.colors.primary,
	},
	ghost: {
		backgroundColor: "transparent",
	},
	// Icon colors
	defaultIcon: {
		color: theme.colors.foreground,
	},
	primaryIcon: {
		color: theme.colors.primaryForeground,
	},
	ghostIcon: {
		color: theme.colors.foreground,
	},
	// Sizes
	size_sm: {
		width: 32,
		height: 32,
	},
	size_md: {
		width: 40,
		height: 40,
	},
	size_lg: {
		width: 52,
		height: 52,
	},
}));

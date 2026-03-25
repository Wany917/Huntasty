import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, TextInput, type TextInputProps, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { Text } from "./text";

interface InputProps extends TextInputProps {
	label?: string;
	error?: string;
	leftIcon?: React.ComponentProps<typeof Ionicons>["name"];
}

export function Input({
	label,
	error,
	leftIcon,
	secureTextEntry,
	style,
	...props
}: InputProps) {
	const { theme } = useUnistyles();
	const [hidden, setHidden] = useState(secureTextEntry);

	return (
		<View style={styles.wrapper}>
			{label && <Text style={styles.label}>{label}</Text>}
			<View style={[styles.container, error && styles.containerError]}>
				{leftIcon && (
					<Ionicons
						name={leftIcon}
						size={20}
						color={theme.colors.mutedForeground}
						style={styles.icon}
					/>
				)}
				<TextInput
					style={[styles.input, leftIcon && styles.inputWithIcon, style]}
					placeholderTextColor={theme.colors.mutedForeground}
					secureTextEntry={hidden}
					{...props}
				/>
				{secureTextEntry && (
					<Pressable
						onPress={() => setHidden((h) => !h)}
						hitSlop={8}
					>
						<Ionicons
							name={hidden ? "eye-off-outline" : "eye-outline"}
							size={20}
							color={theme.colors.mutedForeground}
						/>
					</Pressable>
				)}
			</View>
			{error && <Text style={styles.error}>{error}</Text>}
		</View>
	);
}

const styles = StyleSheet.create((theme) => ({
	wrapper: {
		gap: theme.spacing.sm,
	},
	label: {
		fontSize: theme.fontSize.base,
		fontFamily: theme.fonts.bold,
		color: theme.colors.foreground,
	},
	container: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: theme.colors.surface,
		borderWidth: 1.5, // Figma: 1.5px
		borderColor: theme.colors.input, // #E6EBF2
		borderRadius: theme.borderRadius.xl, // Figma: 16px
		height: 54, // Figma: exact h=54
		paddingHorizontal: theme.spacing.md,
		gap: theme.spacing.sm + 4, // Figma: gap=12
	},
	containerError: {
		borderColor: theme.colors.destructive,
	},
	icon: {},
	input: {
		flex: 1,
		fontSize: theme.fontSize.base, // Figma: 16px
		fontFamily: theme.fonts.regular,
		color: theme.colors.foreground,
	},
	inputWithIcon: {
		paddingLeft: 0,
	},
	error: {
		fontSize: theme.fontSize.xs,
		color: theme.colors.destructive,
	},
}));

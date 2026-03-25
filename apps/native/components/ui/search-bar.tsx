import { Ionicons } from "@expo/vector-icons";
import { Pressable, TextInput, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

interface SearchBarProps {
	value: string;
	onChangeText: (text: string) => void;
	placeholder?: string;
	onFilterPress?: () => void;
}

export function SearchBar({
	value,
	onChangeText,
	placeholder = "Search restaurants...",
	onFilterPress,
}: SearchBarProps) {
	const { theme } = useUnistyles();

	return (
		<View style={styles.container}>
			<Ionicons name="search" size={20} color={theme.colors.mutedForeground} />
			<TextInput
				style={styles.input}
				value={value}
				onChangeText={onChangeText}
				placeholder={placeholder}
				placeholderTextColor={theme.colors.mutedForeground}
			/>
			{onFilterPress && (
				<Pressable onPress={onFilterPress} style={styles.filterBtn}>
					<Ionicons
						name="options-outline"
						size={20}
						color={theme.colors.foreground}
					/>
				</Pressable>
			)}
		</View>
	);
}

const styles = StyleSheet.create((theme) => ({
	container: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: theme.colors.surface,
		borderRadius: theme.borderRadius.full,
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
		gap: theme.spacing.sm,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	input: {
		flex: 1,
		fontSize: theme.fontSize.base,
		fontFamily: theme.fonts.regular,
		color: theme.colors.foreground,
		paddingVertical: theme.spacing.xs,
	},
	filterBtn: {
		padding: theme.spacing.xs,
	},
}));

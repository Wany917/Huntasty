import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "./text";

const FOOD_EMOJIS = [
	"\u{1F35C}", // ramen
	"\u{1F363}", // sushi
	"\u{1F359}", // rice ball
	"\u{1F372}", // pot of food
	"\u{1F371}", // bento
	"\u{1F35B}", // curry rice
	"\u{1F364}", // fried shrimp
	"\u{1F361}", // dango
	"\u{1F370}", // shortcake
	"\u{1F375}", // tea
	"\u{1F354}", // burger
	"\u{1F355}", // pizza
	"\u{1F96A}", // sandwich
	"\u{1F382}", // birthday cake
	"\u{2615}", // coffee
] as const;

const MAX_SELECTION = 5;

interface EmojiPickerProps {
	selected: string[];
	onToggle: (emoji: string) => void;
}

export function EmojiPicker({ selected, onToggle }: EmojiPickerProps) {
	return (
		<View style={styles.grid}>
			{FOOD_EMOJIS.map((emoji) => {
				const isSelected = selected.includes(emoji);
				const isDisabled = !isSelected && selected.length >= MAX_SELECTION;

				return (
					<Pressable
						key={emoji}
						onPress={() => onToggle(emoji)}
						disabled={isDisabled}
						style={[
							styles.cell,
							isSelected && styles.cellSelected,
							isDisabled && styles.cellDisabled,
						]}
					>
						<Text style={styles.emoji}>{emoji}</Text>
					</Pressable>
				);
			})}
		</View>
	);
}

const styles = StyleSheet.create((theme) => ({
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: theme.spacing.sm,
	},
	cell: {
		width: 48,
		height: 48,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: theme.borderRadius.lg,
		backgroundColor: theme.colors.muted,
	},
	cellSelected: {
		backgroundColor: `${theme.colors.brand}30`,
		borderWidth: 2,
		borderColor: theme.colors.brand,
	},
	cellDisabled: {
		opacity: 0.4,
	},
	emoji: {
		fontSize: 24,
	},
}));

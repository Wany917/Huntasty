import { Pressable, ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "./text";

interface PillOption {
	label: string;
	value: string;
}

interface PillProps {
	options: PillOption[];
	selected: string;
	onSelect: (value: string) => void;
	/** "tabs" = Figma segmented control style, "pills" = individual chips */
	variant?: "tabs" | "pills";
}

export function Pill({
	options,
	selected,
	onSelect,
	variant = "pills",
}: PillProps) {
	if (variant === "tabs") {
		// Figma: Container bg=#E6EBF2 r=16, active tab bg=#042628
		return (
			<View style={tabStyles.container}>
				{options.map((option) => {
					const active = option.value === selected;
					return (
						<Pressable
							key={option.value}
							onPress={() => onSelect(option.value)}
							style={[tabStyles.tab, active && tabStyles.tabActive]}
						>
							<Text style={[tabStyles.text, active && tabStyles.textActive]}>
								{option.label}
							</Text>
						</Pressable>
					);
				})}
			</View>
		);
	}

	// Pills variant — horizontal scroll chips
	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={pillStyles.scroll}
		>
			{options.map((option) => {
				const active = option.value === selected;
				return (
					<Pressable
						key={option.value}
						onPress={() => onSelect(option.value)}
						style={[pillStyles.pill, active && pillStyles.pillActive]}
					>
						<Text style={[pillStyles.text, active && pillStyles.textActive]}>
							{option.label}
						</Text>
					</Pressable>
				);
			})}
		</ScrollView>
	);
}

// Figma "Tabs" component: segmented control
const tabStyles = StyleSheet.create((theme) => ({
	container: {
		flexDirection: "row",
		backgroundColor: theme.colors.border, // light: #E6EBF2, dark: #1A3F50
		borderRadius: theme.borderRadius.xl, // 16
		padding: 4,
	},
	tab: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 12,
		borderRadius: theme.borderRadius.xl, // 16
	},
	tabActive: {
		backgroundColor: theme.colors.primary, // navy #042628 in light
	},
	text: {
		fontSize: theme.fontSize.base,
		fontFamily: theme.fonts.bold,
		color: theme.colors.foreground, // #0A2533
	},
	textActive: {
		color: "#FFFFFF",
	},
}));

// Category pills — individual rounded chips
const pillStyles = StyleSheet.create((theme) => ({
	scroll: {
		gap: theme.spacing.sm,
		paddingVertical: theme.spacing.xs,
	},
	pill: {
		paddingHorizontal: theme.spacing.lg,
		paddingVertical: theme.spacing.sm + 2,
		borderRadius: theme.borderRadius.xl, // 16
		backgroundColor: theme.colors.border, // light: #E6EBF2, dark: #1A3F50
	},
	pillActive: {
		backgroundColor: theme.colors.accent, // teal #70B9BE
	},
	text: {
		fontSize: theme.fontSize.sm,
		fontFamily: theme.fonts.bold,
		color: theme.colors.foreground,
	},
	textActive: {
		color: "#FFFFFF",
	},
}));

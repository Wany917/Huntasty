import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "./ui/text";

type HunterLevel =
	| "apprenti"
	| "palaisEveille"
	| "chasseur"
	| "maitre"
	| "genie";

const LEVEL_CONFIG: Record<
	HunterLevel,
	{
		label: string;
		color: string;
		icon: React.ComponentProps<typeof Ionicons>["name"];
	}
> = {
	apprenti: { label: "Apprenti", color: "#97A2B0", icon: "leaf-outline" },
	palaisEveille: {
		label: "Palais Eveill\u00E9",
		color: "#70B9BE",
		icon: "flower-outline",
	},
	chasseur: { label: "Chasseur", color: "#3CA0A7", icon: "shield-outline" },
	maitre: { label: "Ma\u00EEtre", color: "#F59E0B", icon: "star-outline" },
	genie: { label: "G\u00E9nie", color: "#EF4444", icon: "diamond-outline" },
};

interface HunterLevelBadgeProps {
	level: HunterLevel;
}

export function HunterLevelBadge({ level }: HunterLevelBadgeProps) {
	const config = LEVEL_CONFIG[level];

	return (
		<View style={[styles.badge, { backgroundColor: `${config.color}20` }]}>
			<Ionicons name={config.icon} size={14} color={config.color} />
			<Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
		</View>
	);
}

const styles = StyleSheet.create((theme) => ({
	badge: {
		flexDirection: "row",
		alignItems: "center",
		alignSelf: "flex-start",
		gap: theme.spacing.xs,
		paddingHorizontal: theme.spacing.sm,
		paddingVertical: theme.spacing["2xs"] + 1,
		borderRadius: theme.borderRadius.full,
	},
	text: {
		fontSize: theme.fontSize.xs,
		fontFamily: theme.fonts.semiBold,
	},
}));

import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { HunterLevelBadge } from "./hunter-level-badge";
import { Avatar } from "./ui/avatar";
import { Text } from "./ui/text";

type HunterLevel =
	| "apprenti"
	| "palaisEveille"
	| "chasseur"
	| "maitre"
	| "genie";

interface LeaderboardRowProps {
	rank: number;
	name: string;
	avatarUri?: string;
	level: HunterLevel;
	points: number;
	isCurrentUser?: boolean;
}

const MEDAL_COLORS = ["#F59E0B", "#97A2B0", "#CD7F32"] as const;

export function LeaderboardRow({
	rank,
	name,
	avatarUri,
	level,
	points,
	isCurrentUser = false,
}: LeaderboardRowProps) {
	const medal = rank <= 3 ? MEDAL_COLORS[rank - 1] : undefined;

	return (
		<View style={[styles.row, isCurrentUser && styles.highlighted]}>
			<View style={styles.rankContainer}>
				<Text
					variant="label"
					style={[styles.rank, medal ? { color: medal } : undefined]}
				>
					{rank}
				</Text>
			</View>
			<Avatar uri={avatarUri} name={name} size="sm" level={level} />
			<View style={styles.info}>
				<Text variant="label" numberOfLines={1}>
					{name}
				</Text>
				<HunterLevelBadge level={level} />
			</View>
			<Text variant="label" style={styles.points}>
				{points.toLocaleString()} pts
			</Text>
		</View>
	);
}

const styles = StyleSheet.create((theme) => ({
	row: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: theme.spacing.sm,
		paddingHorizontal: theme.spacing.md,
		gap: theme.spacing.sm,
	},
	highlighted: {
		backgroundColor: `${theme.colors.brand}15`,
		borderRadius: theme.borderRadius.lg,
	},
	rankContainer: {
		width: 28,
		alignItems: "center",
	},
	rank: {
		fontSize: theme.fontSize.base,
		fontFamily: theme.fonts.bold,
		color: theme.colors.mutedForeground,
	},
	info: {
		flex: 1,
		gap: theme.spacing["2xs"],
	},
	points: {
		color: theme.colors.brand,
	},
}));

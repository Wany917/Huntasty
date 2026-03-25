import { FlashList } from "@shopify/flash-list";
import { useState } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Container } from "@/components/container";
import { LeaderboardRow } from "@/components/leaderboard-row";
import { Avatar } from "@/components/ui/avatar";
import { Pill } from "@/components/ui/pill";
import { Text } from "@/components/ui/text";

type HunterLevel =
	| "apprenti"
	| "palaisEveille"
	| "chasseur"
	| "maitre"
	| "genie";

const TIME_FILTERS = [
	{ label: "Weekly", value: "weekly" },
	{ label: "Monthly", value: "monthly" },
	{ label: "All Time", value: "all_time" },
];

interface LeaderEntry {
	id: string;
	rank: number;
	name: string;
	level: HunterLevel;
	points: number;
	avatarUri?: string;
	isCurrentUser?: boolean;
}

const MOCK_LEADERS: LeaderEntry[] = [
	{ id: "1", rank: 1, name: "Yuki Tanaka", level: "genie", points: 12450 },
	{ id: "2", rank: 2, name: "Kenji Yamamoto", level: "maitre", points: 9800 },
	{ id: "3", rank: 3, name: "Sakura Ito", level: "maitre", points: 8720 },
	{ id: "4", rank: 4, name: "Ryo Suzuki", level: "chasseur", points: 6340 },
	{ id: "5", rank: 5, name: "Aoi Watanabe", level: "chasseur", points: 5210 },
	{
		id: "6",
		rank: 6,
		name: "Hiro Nakamura",
		level: "palaisEveille",
		points: 3890,
	},
	{ id: "7", rank: 7, name: "Miku Sato", level: "palaisEveille", points: 3120 },
	{
		id: "8",
		rank: 8,
		name: "You",
		level: "apprenti",
		points: 850,
		isCurrentUser: true,
	},
];

function Podium({ leaders }: { leaders: LeaderEntry[] }) {
	const [first, second, third] = leaders;

	return (
		<View style={podiumStyles.container}>
			{/* Second place */}
			<View style={podiumStyles.side}>
				{second && (
					<>
						<Avatar name={second.name} size="md" level={second.level} />
						<Text variant="caption" numberOfLines={1}>
							{second.name}
						</Text>
						<Text variant="label" style={podiumStyles.silver}>
							{second.points.toLocaleString()}
						</Text>
						<View style={[podiumStyles.bar, podiumStyles.barSecond]} />
					</>
				)}
			</View>

			{/* First place */}
			<View style={podiumStyles.center}>
				{first && (
					<>
						<Text style={podiumStyles.crown}>👑</Text>
						<Avatar name={first.name} size="lg" level={first.level} />
						<Text variant="label" numberOfLines={1}>
							{first.name}
						</Text>
						<Text variant="label" style={podiumStyles.gold}>
							{first.points.toLocaleString()}
						</Text>
						<View style={[podiumStyles.bar, podiumStyles.barFirst]} />
					</>
				)}
			</View>

			{/* Third place */}
			<View style={podiumStyles.side}>
				{third && (
					<>
						<Avatar name={third.name} size="md" level={third.level} />
						<Text variant="caption" numberOfLines={1}>
							{third.name}
						</Text>
						<Text variant="label" style={podiumStyles.bronze}>
							{third.points.toLocaleString()}
						</Text>
						<View style={[podiumStyles.bar, podiumStyles.barThird]} />
					</>
				)}
			</View>
		</View>
	);
}

export default function LeaderboardScreen() {
	const [timeFilter, setTimeFilter] = useState("weekly");

	const top3 = MOCK_LEADERS.slice(0, 3);
	const rest = MOCK_LEADERS.slice(3);

	return (
		<Container>
			<FlashList
				data={rest}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.listContent}
				ListHeaderComponent={
					<View style={styles.header}>
						<Text variant="h2">Leaderboard</Text>
						<Pill
							options={TIME_FILTERS}
							selected={timeFilter}
							onSelect={setTimeFilter}
						/>
						<Podium leaders={top3} />
					</View>
				}
				renderItem={({ item }) => (
					<LeaderboardRow
						rank={item.rank}
						name={item.name}
						level={item.level}
						points={item.points}
						avatarUri={item.avatarUri}
						isCurrentUser={item.isCurrentUser}
					/>
				)}
			/>
		</Container>
	);
}

const styles = StyleSheet.create((theme) => ({
	header: {
		gap: theme.spacing.md,
		paddingBottom: theme.spacing.md,
	},
	listContent: {
		padding: theme.spacing.md,
		paddingBottom: 100,
	},
}));

const podiumStyles = StyleSheet.create((theme) => ({
	container: {
		flexDirection: "row",
		alignItems: "flex-end",
		justifyContent: "center",
		paddingTop: theme.spacing.xl,
		gap: theme.spacing.sm,
	},
	center: {
		alignItems: "center",
		gap: theme.spacing["2xs"],
		flex: 1,
	},
	side: {
		alignItems: "center",
		gap: theme.spacing["2xs"],
		flex: 1,
	},
	crown: {
		fontSize: 24,
	},
	gold: {
		color: "#F59E0B",
	},
	silver: {
		color: "#97A2B0",
	},
	bronze: {
		color: "#CD7F32",
	},
	bar: {
		width: "100%",
		borderTopLeftRadius: theme.borderRadius.md,
		borderTopRightRadius: theme.borderRadius.md,
		marginTop: theme.spacing.xs,
	},
	barFirst: {
		height: 80,
		backgroundColor: `${"#F59E0B"}30`,
	},
	barSecond: {
		height: 60,
		backgroundColor: `${"#97A2B0"}30`,
	},
	barThird: {
		height: 44,
		backgroundColor: `${"#CD7F32"}30`,
	},
}));

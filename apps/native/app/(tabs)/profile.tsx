import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Container } from "@/components/container";
import { HunterLevelBadge } from "@/components/hunter-level-badge";
import { ReviewCard } from "@/components/review-card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Text } from "@/components/ui/text";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/trpc";

const MOCK_REVIEWS = [
	{
		id: "1",
		authorName: "You",
		authorLevel: "apprenti" as const,
		rating: 4,
		content: "Amazing tonkotsu ramen with rich broth!",
		createdAt: "2 days ago",
		likeCount: 3,
	},
	{
		id: "2",
		authorName: "You",
		authorLevel: "apprenti" as const,
		rating: 5,
		content: "Best sushi omakase experience in Shibuya.",
		createdAt: "1 week ago",
		likeCount: 8,
	},
];

function StatBox({ label, value }: { label: string; value: string }) {
	return (
		<View style={statStyles.box}>
			<Text variant="h3">{value}</Text>
			<Text variant="caption">{label}</Text>
		</View>
	);
}

export default function ProfileScreen() {
	const { data: session } = authClient.useSession();
	const user = session?.user;

	if (!user) {
		return (
			<Container>
				<View style={styles.centered}>
					<Text variant="h3">Sign in to view your profile</Text>
					<Button
						variant="primary"
						onPress={() => router.push("/(auth)/sign-in")}
					>
						Sign In
					</Button>
				</View>
			</Container>
		);
	}

	return (
		<Container>
			<FlashList
				data={MOCK_REVIEWS}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.listContent}
				ListHeaderComponent={
					<View style={styles.header}>
						<View style={styles.profileRow}>
							<Avatar name={user.name} size="lg" level="apprenti" />
							<View style={styles.profileInfo}>
								<Text variant="h2">{user.name}</Text>
								<HunterLevelBadge level="apprenti" />
							</View>
						</View>

						<View style={styles.xpRow}>
							<Text variant="bodySm">850 / 1,000 XP</Text>
							<Text variant="caption">Next: Palais Eveill\u00E9</Text>
						</View>
						<ProgressBar progress={0.85} />

						<View style={styles.statsRow}>
							<StatBox label="Reviews" value="12" />
							<StatBox label="Check-ins" value="28" />
							<StatBox label="Points" value="850" />
						</View>

						<Divider />

						<View style={styles.section}>
							<Text variant="h3">Recent Reviews</Text>
						</View>
					</View>
				}
				ItemSeparatorComponent={() => <View style={styles.separator} />}
				renderItem={({ item }) => (
					<ReviewCard
						authorName={item.authorName}
						authorLevel={item.authorLevel}
						rating={item.rating}
						content={item.content}
						createdAt={item.createdAt}
						likeCount={item.likeCount}
					/>
				)}
				ListFooterComponent={
					<View style={styles.footer}>
						<Button
							variant="destructive"
							onPress={() => {
								authClient.signOut();
								queryClient.invalidateQueries();
							}}
						>
							Sign Out
						</Button>
					</View>
				}
			/>
		</Container>
	);
}

const styles = StyleSheet.create((theme) => ({
	centered: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: theme.spacing.md,
		padding: theme.spacing.xl,
	},
	header: {
		gap: theme.spacing.md,
		paddingBottom: theme.spacing.md,
	},
	profileRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: theme.spacing.md,
	},
	profileInfo: {
		flex: 1,
		gap: theme.spacing.xs,
	},
	xpRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	statsRow: {
		flexDirection: "row",
		gap: theme.spacing.sm,
	},
	section: {
		paddingTop: theme.spacing.sm,
	},
	separator: {
		height: theme.spacing.md,
	},
	listContent: {
		padding: theme.spacing.md,
		paddingBottom: 100,
	},
	footer: {
		paddingTop: theme.spacing.xl,
		paddingBottom: theme.spacing.xl,
	},
}));

const statStyles = StyleSheet.create((theme) => ({
	box: {
		flex: 1,
		alignItems: "center",
		paddingVertical: theme.spacing.md,
		backgroundColor: theme.colors.muted,
		borderRadius: theme.borderRadius.lg,
		gap: theme.spacing["2xs"],
	},
}));

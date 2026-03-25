import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Dimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { ReviewCard } from "@/components/review-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { IconButton } from "@/components/ui/icon-button";
import { Pill } from "@/components/ui/pill";
import { StarRating } from "@/components/ui/star-rating";
import { Text } from "@/components/ui/text";

const SCREEN_WIDTH = Dimensions.get("window").width;

const TABS = [
	{ label: "Reviews", value: "reviews" },
	{ label: "Menu", value: "menu" },
	{ label: "Info", value: "info" },
];

const MOCK_REVIEWS = [
	{
		id: "1",
		authorName: "Yuki Tanaka",
		authorLevel: "genie" as const,
		rating: 5,
		content: "Incredible omakase. The tuna was beyond perfect.",
		createdAt: "3 days ago",
		likeCount: 12,
	},
	{
		id: "2",
		authorName: "Kenji Yamamoto",
		authorLevel: "maitre" as const,
		rating: 4,
		content: "Great atmosphere and fresh fish. Service was a bit slow.",
		createdAt: "1 week ago",
		likeCount: 5,
	},
	{
		id: "3",
		authorName: "Sakura Ito",
		authorLevel: "chasseur" as const,
		rating: 5,
		content: "A must-visit! The seasonal course was outstanding.",
		createdAt: "2 weeks ago",
		likeCount: 8,
	},
];

export default function RestaurantDetailScreen() {
	const { id: _id } = useLocalSearchParams<{ id: string }>();
	const { theme } = useUnistyles();
	const insets = useSafeAreaInsets();
	const [activeTab, setActiveTab] = useState("reviews");

	return (
		<View style={styles.container}>
			<FlashList
				data={activeTab === "reviews" ? MOCK_REVIEWS : []}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.listContent}
				ListHeaderComponent={
					<View>
						{/* Hero Image */}
						<View style={styles.hero}>
							<View style={styles.heroPlaceholder}>
								<Ionicons
									name="image-outline"
									size={48}
									color={theme.colors.grey400}
								/>
							</View>
							{/* Back button */}
							<View style={[styles.backBtn, { top: insets.top + 8 }]}>
								<IconButton
									icon="arrow-back"
									variant="default"
									size="md"
									onPress={() => router.back()}
								/>
							</View>
						</View>

						{/* Info */}
						<View style={styles.info}>
							<View style={styles.nameRow}>
								<Text variant="h1" style={styles.name}>
									Sushi Saito
								</Text>
								<Badge variant="level">Partner</Badge>
							</View>

							<View style={styles.metaRow}>
								<Text variant="bodySm" style={styles.cuisine}>
									Sushi \u00B7 Omakase
								</Text>
								<View style={styles.distanceRow}>
									<Ionicons
										name="location-outline"
										size={14}
										color={theme.colors.mutedForeground}
									/>
									<Text variant="caption">1.2km</Text>
								</View>
							</View>

							<View style={styles.ratingRow}>
								<StarRating value={4.8} readOnly size={20} />
								<Text variant="label">4.8</Text>
								<Text variant="caption">(256 reviews)</Text>
							</View>

							<Text variant="bodySm" style={styles.address}>
								Minato City, Akasaka 1-9-13
							</Text>

							<Button
								variant="primary"
								size="lg"
								onPress={() => router.push("/review/new")}
							>
								Write a Review
							</Button>

							<Divider />

							<Pill
								options={TABS}
								selected={activeTab}
								onSelect={setActiveTab}
							/>
						</View>

						{activeTab === "menu" && (
							<View style={styles.tabContent}>
								<Text variant="body" style={styles.mutedText}>
									Menu information coming soon
								</Text>
							</View>
						)}

						{activeTab === "info" && (
							<View style={styles.tabContent}>
								<View style={styles.infoItem}>
									<Ionicons
										name="time-outline"
										size={18}
										color={theme.colors.mutedForeground}
									/>
									<Text variant="body">11:30 - 14:00, 17:00 - 22:00</Text>
								</View>
								<View style={styles.infoItem}>
									<Ionicons
										name="call-outline"
										size={18}
										color={theme.colors.mutedForeground}
									/>
									<Text variant="body">+81 3-3589-4562</Text>
								</View>
								<View style={styles.infoItem}>
									<Ionicons
										name="card-outline"
										size={18}
										color={theme.colors.mutedForeground}
									/>
									<Text variant="body">Cash, Credit Card</Text>
								</View>
							</View>
						)}
					</View>
				}
				ItemSeparatorComponent={() => <View style={styles.separator} />}
				renderItem={({ item }) => (
					<View style={styles.reviewWrapper}>
						<ReviewCard
							authorName={item.authorName}
							authorLevel={item.authorLevel}
							rating={item.rating}
							content={item.content}
							createdAt={item.createdAt}
							likeCount={item.likeCount}
						/>
					</View>
				)}
			/>
		</View>
	);
}

const styles = StyleSheet.create((theme) => ({
	container: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	hero: {
		width: SCREEN_WIDTH,
		height: 240,
	},
	heroPlaceholder: {
		flex: 1,
		backgroundColor: theme.colors.muted,
		alignItems: "center",
		justifyContent: "center",
	},
	backBtn: {
		position: "absolute",
		left: theme.spacing.md,
	},
	info: {
		padding: theme.spacing.md,
		gap: theme.spacing.sm,
	},
	nameRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	name: {
		flex: 1,
	},
	metaRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	cuisine: {
		color: theme.colors.mutedForeground,
	},
	distanceRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 2,
	},
	ratingRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: theme.spacing.sm,
	},
	address: {
		color: theme.colors.mutedForeground,
	},
	tabContent: {
		padding: theme.spacing.md,
		gap: theme.spacing.md,
	},
	mutedText: {
		color: theme.colors.mutedForeground,
	},
	infoItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: theme.spacing.sm,
	},
	separator: {
		height: theme.spacing.md,
	},
	reviewWrapper: {
		paddingHorizontal: theme.spacing.md,
	},
	listContent: {
		paddingBottom: 40,
	},
}));

import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
	Dimensions,
	Pressable,
	RefreshControl,
	ScrollView,
	View,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { Container } from "@/components/container";
import { FeaturedCard } from "@/components/featured-card";
import { PopularCard } from "@/components/popular-card";
import { Pill } from "@/components/ui/pill";
import { Text } from "@/components/ui/text";
import { authClient } from "@/lib/auth-client";

const CATEGORIES = [
	{ label: "Ramen", value: "ramen" },
	{ label: "Sushi", value: "sushi" },
	{ label: "Yakitori", value: "yakitori" },
	{ label: "Tempura", value: "tempura" },
	{ label: "Udon", value: "udon" },
	{ label: "Izakaya", value: "izakaya" },
];

// Mock data — will be replaced with tRPC queries
const FEATURED = [
	{
		id: "f1",
		name: "Asian white noodles with extra seafood",
		imageUri: undefined,
		authorName: "James Spader",
		duration: "20 Min",
	},
	{
		id: "f2",
		name: "Healthy Taco Salad with fresh vegetables",
		imageUri: undefined,
		authorName: "Olivia Chen",
		duration: "15 Min",
	},
	{
		id: "f3",
		name: "Authentic Miso Ramen from Hokkaido",
		imageUri: undefined,
		authorName: "Kenji Tanaka",
		duration: "30 Min",
	},
];

const POPULAR = [
	{
		id: "p1",
		name: "Healthy Taco Salad with fresh vegetables",
		cuisine: "Mexican",
		rating: 4.5,
		distance: "350m",
		imageUri: undefined,
	},
	{
		id: "p2",
		name: "Japanese-style Pancakes Recipe",
		cuisine: "Japanese",
		rating: 4.8,
		distance: "1.2km",
		imageUri: undefined,
	},
	{
		id: "p3",
		name: "Tsuta Ramen Special",
		cuisine: "Ramen",
		rating: 4.6,
		distance: "550m",
		imageUri: undefined,
	},
	{
		id: "p4",
		name: "Sushi Omakase Platter",
		cuisine: "Sushi",
		rating: 4.9,
		distance: "800m",
		imageUri: undefined,
	},
];

function getGreeting(): string {
	const hour = new Date().getHours();
	if (hour < 12) return "Good Morning";
	if (hour < 17) return "Good Afternoon";
	return "Good Evening";
}

export default function HomeScreen() {
	const { theme } = useUnistyles();
	const [category, setCategory] = useState("ramen");
	const [refreshing, setRefreshing] = useState(false);
	const [favorites, setFavorites] = useState<Set<string>>(new Set());
	const { data: session } = authClient.useSession();

	const onRefresh = async () => {
		setRefreshing(true);
		// TODO: refetch queries
		setTimeout(() => setRefreshing(false), 1000);
	};

	const toggleFavorite = (id: string) => {
		setFavorites((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const greeting = getGreeting();
	const name = session?.user?.name?.split(" ")[0] ?? "Hunter";
	// 2 columns: (screenWidth - padding*2 - gap) / 2
	const screenWidth = Dimensions.get("window").width;
	const cardWidth = (screenWidth - 24 * 2 - 16) / 2;

	return (
		<Container>
			<ScrollView
				contentContainerStyle={styles.scroll}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
			>
				{/* Header */}
				<View style={styles.headerRow}>
					<View>
						<View style={styles.greetingRow}>
							<Ionicons
								name="sunny-outline"
								size={16}
								color={theme.colors.mutedForeground}
							/>
							<Text variant="bodySm" style={styles.greetingText}>
								{greeting}
							</Text>
						</View>
						<Text variant="h2">{name}</Text>
					</View>
					<Pressable style={styles.notifBtn} hitSlop={8}>
						<Ionicons
							name="notifications-outline"
							size={22}
							color={theme.colors.foreground}
						/>
					</Pressable>
				</View>

				{/* Featured */}
				<View style={styles.section}>
					<Text variant="h3">Featured</Text>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={styles.featuredScroll}
					>
						{FEATURED.map((item) => (
							<FeaturedCard
								key={item.id}
								name={item.name}
								imageUri={item.imageUri}
								authorName={item.authorName}
								duration={item.duration}
							/>
						))}
					</ScrollView>
				</View>

				{/* Category */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Text variant="h3">Category</Text>
						<Pressable hitSlop={8}>
							<Text style={styles.seeAll}>See All</Text>
						</Pressable>
					</View>
					<Pill
						options={CATEGORIES}
						selected={category}
						onSelect={setCategory}
					/>
				</View>

				{/* Popular */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Text variant="h3">Popular Spots</Text>
						<Pressable hitSlop={8}>
							<Text style={styles.seeAll}>See All</Text>
						</Pressable>
					</View>
					<View style={styles.grid}>
						{POPULAR.map((item) => (
							<View key={item.id} style={{ width: cardWidth }}>
								<PopularCard
									name={item.name}
									cuisine={item.cuisine}
									rating={item.rating}
									distance={item.distance}
									imageUri={item.imageUri}
									isFavorite={favorites.has(item.id)}
									onFavorite={() => toggleFavorite(item.id)}
								/>
							</View>
						))}
					</View>
				</View>
			</ScrollView>
		</Container>
	);
}

const styles = StyleSheet.create((theme) => ({
	scroll: {
		padding: theme.spacing.lg,
		paddingBottom: 120,
	},
	headerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
	},
	greetingRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: theme.spacing.xs,
		marginBottom: theme.spacing.xs,
	},
	greetingText: {
		color: theme.colors.mutedForeground,
	},
	notifBtn: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "center",
	},
	section: {
		marginTop: theme.spacing.lg,
		gap: theme.spacing.md,
	},
	sectionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	seeAll: {
		fontSize: theme.fontSize.sm,
		fontFamily: theme.fonts.bold,
		color: theme.colors.secondary, // teal
	},
	featuredScroll: {
		gap: theme.spacing.md,
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: theme.spacing.md,
	},
}));

import { useState } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Container } from "@/components/container";
import { RestaurantCard } from "@/components/restaurant-card";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { SearchBar } from "@/components/ui/search-bar";
import { Text } from "@/components/ui/text";

export default function ExploreScreen() {
	const [search, setSearch] = useState("");
	const [sheetVisible, setSheetVisible] = useState(true);

	return (
		<Container>
			<View style={styles.mapPlaceholder}>
				<Text variant="h3" style={styles.placeholderText}>
					Map View
				</Text>
				<Text variant="caption" style={styles.placeholderSub}>
					Mapbox integration coming soon
				</Text>
			</View>

			<View style={styles.searchOverlay}>
				<SearchBar
					value={search}
					onChangeText={setSearch}
					placeholder="Search nearby..."
					onFilterPress={() => {}}
				/>
			</View>

			<BottomSheet
				visible={sheetVisible}
				onClose={() => setSheetVisible(false)}
				snapPoint={0.4}
			>
				<Text variant="h3" style={styles.sheetTitle}>
					Nearby Restaurants
				</Text>
				<View style={styles.sheetList}>
					<RestaurantCard
						name="Ichiran Shibuya"
						cuisine="Ramen"
						rating={4.3}
						reviewCount={312}
						distance="120m"
					/>
					<RestaurantCard
						name="Afuri Ebisu"
						cuisine="Ramen"
						rating={4.5}
						reviewCount={187}
						distance="450m"
					/>
				</View>
			</BottomSheet>
		</Container>
	);
}

const styles = StyleSheet.create((theme) => ({
	mapPlaceholder: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: theme.colors.muted,
	},
	placeholderText: {
		color: theme.colors.mutedForeground,
	},
	placeholderSub: {
		marginTop: theme.spacing.xs,
	},
	searchOverlay: {
		position: "absolute",
		top: 60,
		left: theme.spacing.md,
		right: theme.spacing.md,
	},
	sheetTitle: {
		marginBottom: theme.spacing.md,
	},
	sheetList: {
		gap: theme.spacing.md,
	},
}));

import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { StarRating } from "./ui/star-rating";
import { Text } from "./ui/text";

interface RestaurantCardProps {
	name: string;
	cuisine: string;
	rating: number;
	reviewCount: number;
	distance?: string;
	imageUri?: string;
	priceRange?: string;
	onPress?: () => void;
}

export function RestaurantCard({
	name,
	cuisine,
	rating,
	reviewCount,
	distance,
	imageUri,
	priceRange,
	onPress,
}: RestaurantCardProps) {
	const { theme } = useUnistyles();

	return (
		<Pressable onPress={onPress}>
			<Card imageUri={imageUri}>
				<View style={styles.header}>
					<Text variant="h3" numberOfLines={1} style={styles.name}>
						{name}
					</Text>
					{priceRange && <Badge>{priceRange}</Badge>}
				</View>
				<Text variant="bodySm" style={styles.cuisine}>
					{cuisine}
				</Text>
				<View style={styles.footer}>
					<StarRating value={rating} readOnly size={16} />
					<Text variant="caption">({reviewCount})</Text>
					{distance && (
						<View style={styles.distance}>
							<Ionicons
								name="location-outline"
								size={14}
								color={theme.colors.mutedForeground}
							/>
							<Text variant="caption">{distance}</Text>
						</View>
					)}
				</View>
			</Card>
		</Pressable>
	);
}

const styles = StyleSheet.create((theme) => ({
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: theme.spacing.sm,
	},
	name: {
		flex: 1,
	},
	cuisine: {
		color: theme.colors.mutedForeground,
		marginTop: theme.spacing["2xs"],
	},
	footer: {
		flexDirection: "row",
		alignItems: "center",
		gap: theme.spacing.sm,
		marginTop: theme.spacing.sm,
	},
	distance: {
		flexDirection: "row",
		alignItems: "center",
		gap: 2,
		marginLeft: "auto",
	},
}));

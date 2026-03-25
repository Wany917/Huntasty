import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { Text } from "./ui/text";

interface PopularCardProps {
	name: string;
	imageUri?: string;
	cuisine?: string;
	rating?: number;
	distance?: string;
	isFavorite?: boolean;
	onPress?: () => void;
	onFavorite?: () => void;
}

export function PopularCard({
	name,
	imageUri,
	cuisine,
	rating,
	distance,
	isFavorite = false,
	onPress,
	onFavorite,
}: PopularCardProps) {
	const { theme } = useUnistyles();

	return (
		<Pressable
			style={(state) => [styles.card, state.pressed && styles.pressed]}
			onPress={onPress}
		>
			<View style={styles.imageContainer}>
				{imageUri ? (
					<Image
						source={{ uri: imageUri }}
						style={styles.image}
						contentFit="cover"
						transition={200}
					/>
				) : (
					<View style={styles.placeholder}>
						<Ionicons
							name="restaurant-outline"
							size={32}
							color={theme.colors.mutedForeground}
						/>
					</View>
				)}
				<Pressable style={styles.heartBtn} onPress={onFavorite} hitSlop={8}>
					<Ionicons
						name={isFavorite ? "heart" : "heart-outline"}
						size={18}
						color={
							isFavorite ? theme.colors.destructive : theme.colors.foreground
						}
					/>
				</Pressable>
			</View>

			<View style={styles.info}>
				<Text style={styles.name} numberOfLines={2}>
					{name}
				</Text>
				<View style={styles.meta}>
					{cuisine && (
						<View style={styles.metaItem}>
							<Ionicons
								name="flame-outline"
								size={12}
								color={theme.colors.mutedForeground}
							/>
							<Text style={styles.metaText}>{cuisine}</Text>
						</View>
					)}
					{rating && (
						<View style={styles.metaItem}>
							<Ionicons name="star" size={12} color="#F59E0B" />
							<Text style={styles.metaText}>{rating}</Text>
						</View>
					)}
					{distance && (
						<View style={styles.metaItem}>
							<Ionicons
								name="location-outline"
								size={12}
								color={theme.colors.mutedForeground}
							/>
							<Text style={styles.metaText}>{distance}</Text>
						</View>
					)}
				</View>
			</View>
		</Pressable>
	);
}

const styles = StyleSheet.create((theme) => ({
	card: {
		backgroundColor: theme.colors.card,
		borderRadius: theme.borderRadius.xl,
		overflow: "hidden",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.06,
		shadowRadius: 8,
		elevation: 2,
	},
	pressed: {
		opacity: 0.9,
	},
	imageContainer: {
		position: "relative",
		aspectRatio: 1,
	},
	image: {
		width: "100%",
		height: "100%",
	},
	placeholder: {
		width: "100%",
		height: "100%",
		backgroundColor: theme.colors.grey200,
		alignItems: "center",
		justifyContent: "center",
	},
	heartBtn: {
		position: "absolute",
		top: theme.spacing.sm,
		right: theme.spacing.sm,
		width: 30,
		height: 30,
		borderRadius: 15,
		backgroundColor: `${theme.colors.card}CC`,
		alignItems: "center",
		justifyContent: "center",
	},
	info: {
		padding: theme.spacing.sm + 2,
		gap: theme.spacing.xs,
	},
	name: {
		fontSize: theme.fontSize.sm,
		fontFamily: theme.fonts.bold,
		color: theme.colors.foreground,
	},
	meta: {
		flexDirection: "row",
		alignItems: "center",
		gap: theme.spacing.sm,
		flexWrap: "wrap",
	},
	metaItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 2,
	},
	metaText: {
		fontSize: theme.fontSize.xs,
		fontFamily: theme.fonts.regular,
		color: theme.colors.mutedForeground,
	},
}));

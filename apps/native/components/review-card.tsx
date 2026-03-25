import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { HunterLevelBadge } from "./hunter-level-badge";
import { Avatar } from "./ui/avatar";
import { StarRating } from "./ui/star-rating";
import { Text } from "./ui/text";

type HunterLevel =
	| "apprenti"
	| "palaisEveille"
	| "chasseur"
	| "maitre"
	| "genie";

interface ReviewCardProps {
	authorName: string;
	authorAvatar?: string;
	authorLevel: HunterLevel;
	rating: number;
	content?: string;
	photoUri?: string;
	emojis?: string[];
	likeCount?: number;
	liked?: boolean;
	onLikePress?: () => void;
	createdAt: string;
}

export function ReviewCard({
	authorName,
	authorAvatar,
	authorLevel,
	rating,
	content,
	photoUri,
	emojis,
	likeCount = 0,
	liked = false,
	onLikePress,
	createdAt,
}: ReviewCardProps) {
	const { theme } = useUnistyles();

	return (
		<View style={styles.card}>
			<View style={styles.header}>
				<Avatar
					uri={authorAvatar}
					name={authorName}
					size="md"
					level={authorLevel}
				/>
				<View style={styles.headerInfo}>
					<View style={styles.nameRow}>
						<Text variant="label">{authorName}</Text>
						<HunterLevelBadge level={authorLevel} />
					</View>
					<Text variant="caption">{createdAt}</Text>
				</View>
			</View>

			<StarRating value={rating} readOnly size={16} />

			{content && (
				<Text variant="body" style={styles.content}>
					{content}
				</Text>
			)}

			{photoUri && (
				<Image
					source={{ uri: photoUri }}
					style={styles.photo}
					contentFit="cover"
					transition={200}
				/>
			)}

			{emojis && emojis.length > 0 && (
				<View style={styles.emojis}>
					{emojis.map((emoji) => (
						<Text key={emoji} style={styles.emoji}>
							{emoji}
						</Text>
					))}
				</View>
			)}

			<View style={styles.footer}>
				<Pressable onPress={onLikePress} style={styles.likeBtn}>
					<Ionicons
						name={liked ? "heart" : "heart-outline"}
						size={20}
						color={
							liked ? theme.colors.destructive : theme.colors.mutedForeground
						}
					/>
					{likeCount > 0 && <Text variant="caption">{likeCount}</Text>}
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create((theme) => ({
	card: {
		backgroundColor: theme.colors.card,
		borderRadius: theme.borderRadius.xl,
		padding: theme.spacing.md,
		gap: theme.spacing.sm,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		gap: theme.spacing.sm,
	},
	headerInfo: {
		flex: 1,
		gap: theme.spacing["2xs"],
	},
	nameRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: theme.spacing.sm,
	},
	content: {
		color: theme.colors.foreground,
	},
	photo: {
		width: "100%",
		height: 180,
		borderRadius: theme.borderRadius.lg,
	},
	emojis: {
		flexDirection: "row",
		gap: theme.spacing.xs,
	},
	emoji: {
		fontSize: 20,
	},
	footer: {
		flexDirection: "row",
	},
	likeBtn: {
		flexDirection: "row",
		alignItems: "center",
		gap: theme.spacing.xs,
	},
}));

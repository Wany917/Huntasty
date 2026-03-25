import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Avatar } from "./ui/avatar";
import { Text } from "./ui/text";

interface FeaturedCardProps {
	name: string;
	imageUri?: string;
	authorName: string;
	authorAvatar?: string;
	duration?: string;
	onPress?: () => void;
}

export function FeaturedCard({
	name,
	imageUri,
	authorName,
	authorAvatar,
	duration,
	onPress,
}: FeaturedCardProps) {
	return (
		<Pressable
			style={(state) => [styles.card, state.pressed && styles.pressed]}
			onPress={onPress}
		>
			{/* Teal background */}
			<View style={styles.bg} />

			{/* Food image — offset to the right */}
			{imageUri && (
				<Image
					source={{ uri: imageUri }}
					style={styles.image}
					contentFit="cover"
					transition={200}
				/>
			)}

			{/* Overlay content at bottom */}
			<View style={styles.overlay}>
				<Text style={styles.title} numberOfLines={2}>
					{name}
				</Text>
				<View style={styles.meta}>
					<Avatar size="sm" uri={authorAvatar} name={authorName} />
					<Text style={styles.author} numberOfLines={1}>
						{authorName}
					</Text>
					{duration && (
						<View style={styles.duration}>
							<Ionicons name="time-outline" size={14} color="#FFFFFF" />
							<Text style={styles.durationText}>{duration}</Text>
						</View>
					)}
				</View>
			</View>
		</Pressable>
	);
}

const styles = StyleSheet.create((theme) => ({
	card: {
		width: 260,
		height: 190,
		borderRadius: theme.borderRadius.xl,
		overflow: "hidden",
		position: "relative",
	},
	pressed: {
		opacity: 0.9,
	},
	bg: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: theme.colors.secondary, // teal #70B9BE
	},
	image: {
		position: "absolute",
		top: 0,
		right: -10,
		width: 180,
		height: 180,
		borderRadius: 90,
	},
	overlay: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		padding: theme.spacing.md,
		gap: theme.spacing.sm,
	},
	title: {
		fontSize: theme.fontSize.base,
		fontFamily: theme.fonts.bold,
		color: "#FFFFFF",
		maxWidth: 160,
	},
	meta: {
		flexDirection: "row",
		alignItems: "center",
		gap: theme.spacing.sm,
	},
	author: {
		fontSize: theme.fontSize.xs,
		fontFamily: theme.fonts.regular,
		color: "#FFFFFF",
		flex: 1,
	},
	duration: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	durationText: {
		fontSize: theme.fontSize.xs,
		fontFamily: theme.fonts.regular,
		color: "#FFFFFF",
	},
}));

import { Image } from "expo-image";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { Text } from "./text";

type AvatarSize = "sm" | "md" | "lg";
type HunterLevel =
	| "apprenti"
	| "palaisEveille"
	| "chasseur"
	| "maitre"
	| "genie";

interface AvatarProps {
	uri?: string | null;
	name?: string;
	size?: AvatarSize;
	level?: HunterLevel;
}

const SIZES: Record<AvatarSize, number> = { sm: 32, md: 40, lg: 56 };
const FONT_SIZES: Record<AvatarSize, number> = { sm: 12, md: 14, lg: 20 };
const RING_WIDTH: Record<AvatarSize, number> = { sm: 2, md: 2, lg: 3 };

const LEVEL_COLORS: Record<HunterLevel, string> = {
	apprenti: "#97A2B0",
	palaisEveille: "#70B9BE",
	chasseur: "#3CA0A7",
	maitre: "#F59E0B",
	genie: "#EF4444",
};

function getInitials(name?: string): string {
	if (!name) return "?";
	return name
		.split(" ")
		.map((w) => w[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

export function Avatar({ uri, name, size = "md", level }: AvatarProps) {
	const { theme } = useUnistyles();
	const px = SIZES[size];
	const ringColor = level ? LEVEL_COLORS[level] : undefined;

	return (
		<View
			style={[
				styles.ring,
				{
					width: px + (ringColor ? RING_WIDTH[size] * 2 + 2 : 0),
					height: px + (ringColor ? RING_WIDTH[size] * 2 + 2 : 0),
					borderWidth: ringColor ? RING_WIDTH[size] : 0,
					borderColor: ringColor ?? "transparent",
					borderRadius: 9999,
				},
			]}
		>
			{uri ? (
				<Image
					source={{ uri }}
					style={{
						width: px,
						height: px,
						borderRadius: px / 2,
					}}
					contentFit="cover"
					transition={200}
				/>
			) : (
				<View
					style={[
						styles.fallback,
						{
							width: px,
							height: px,
							borderRadius: px / 2,
							backgroundColor: theme.colors.secondary,
						},
					]}
				>
					<Text
						style={{
							fontSize: FONT_SIZES[size],
							fontFamily: theme.fonts.semiBold,
							color: theme.colors.secondaryForeground,
						}}
					>
						{getInitials(name)}
					</Text>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create((_theme) => ({
	ring: {
		alignItems: "center",
		justifyContent: "center",
	},
	fallback: {
		alignItems: "center",
		justifyContent: "center",
	},
}));

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

export default function HuntScreen() {
	// Auto-navigate to review flow when this tab is focused
	// For now, show a launcher screen
	return (
		<Container>
			<View style={styles.container}>
				<View style={styles.iconCircle}>
					<Ionicons name="restaurant" size={48} color="#FFFFFF" />
				</View>
				<Text variant="h2" style={styles.title}>
					Start a Hunt
				</Text>
				<Text variant="body" style={styles.subtitle}>
					Discover a restaurant, snap a photo, and earn points!
				</Text>

				<View style={styles.options}>
					<Button
						variant="primary"
						size="lg"
						onPress={() => router.push("/review/new")}
					>
						Write a Review
					</Button>
					<Button
						variant="outline"
						size="lg"
						onPress={() => router.push("/review/new")}
					>
						Quick Check-in
					</Button>
				</View>

				<View style={styles.info}>
					<View style={styles.infoRow}>
						<Ionicons name="star" size={16} color="#F59E0B" />
						<Text variant="bodySm">Full Review: 15 pts</Text>
					</View>
					<View style={styles.infoRow}>
						<Ionicons name="camera" size={16} color="#70B9BE" />
						<Text variant="bodySm">Quick Snap: 5 pts</Text>
					</View>
					<View style={styles.infoRow}>
						<Ionicons name="location" size={16} color="#3CA0A7" />
						<Text variant="bodySm">Check-in: 5 pts</Text>
					</View>
				</View>
			</View>
		</Container>
	);
}

const styles = StyleSheet.create((theme) => ({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: theme.spacing.xl,
		gap: theme.spacing.md,
	},
	iconCircle: {
		width: 96,
		height: 96,
		borderRadius: 48,
		backgroundColor: theme.colors.brand,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: theme.spacing.sm,
	},
	title: {
		textAlign: "center",
	},
	subtitle: {
		textAlign: "center",
		color: theme.colors.mutedForeground,
	},
	options: {
		width: "100%",
		gap: theme.spacing.sm,
		marginTop: theme.spacing.lg,
	},
	info: {
		gap: theme.spacing.sm,
		marginTop: theme.spacing.lg,
		alignItems: "flex-start",
	},
	infoRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: theme.spacing.sm,
	},
}));

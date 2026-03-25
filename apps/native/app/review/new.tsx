import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	TextInput,
	View,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { PointsAnimation } from "@/components/points-animation";
import { Button } from "@/components/ui/button";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { Pill } from "@/components/ui/pill";
import { SearchBar } from "@/components/ui/search-bar";
import { StarRating } from "@/components/ui/star-rating";
import { Text } from "@/components/ui/text";

type ReviewType = "check_in" | "quick_snap" | "full_review";

const REVIEW_TYPES = [
	{ label: "Check-in", value: "check_in" },
	{ label: "Quick Snap", value: "quick_snap" },
	{ label: "Full Review", value: "full_review" },
];

const POINTS_MAP: Record<ReviewType, number> = {
	check_in: 5,
	quick_snap: 5,
	full_review: 15,
};

export default function NewReviewScreen() {
	const { theme } = useUnistyles();
	const [step, setStep] = useState(1);
	const [restaurantSearch, setRestaurantSearch] = useState("");
	const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(
		null,
	);
	const [reviewType, setReviewType] = useState<ReviewType>("full_review");
	const [rating, setRating] = useState(0);
	const [content, setContent] = useState("");
	const [emojis, setEmojis] = useState<string[]>([]);
	const [showPoints, setShowPoints] = useState(false);
	const [submitted, setSubmitted] = useState(false);

	const handleEmojiToggle = (emoji: string) => {
		setEmojis((prev) =>
			prev.includes(emoji) ? prev.filter((e) => e !== emoji) : [...prev, emoji],
		);
	};

	const handleSubmit = () => {
		Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
		setSubmitted(true);
		setShowPoints(true);
	};

	if (submitted) {
		return (
			<View style={styles.successContainer}>
				<PointsAnimation
					points={POINTS_MAP[reviewType]}
					visible={showPoints}
					onComplete={() => setShowPoints(false)}
				/>
				<View style={styles.successContent}>
					<View style={styles.successIcon}>
						<Ionicons
							name="checkmark-circle"
							size={64}
							color={theme.colors.success}
						/>
					</View>
					<Text variant="h2">Review Submitted!</Text>
					<Text variant="body" style={styles.successText}>
						You earned {POINTS_MAP[reviewType]} points
					</Text>
					<Button variant="primary" size="lg" onPress={() => router.back()}>
						Back to Home
					</Button>
				</View>
			</View>
		);
	}

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<ScrollView
				contentContainerStyle={styles.scroll}
				keyboardShouldPersistTaps="handled"
			>
				{/* Step indicator */}
				<View style={styles.steps}>
					{[1, 2, 3].map((s) => (
						<View
							key={s}
							style={[
								styles.stepDot,
								s === step && styles.stepDotActive,
								s < step && styles.stepDotDone,
							]}
						/>
					))}
				</View>

				{/* Step 1: Select restaurant */}
				{step === 1 && (
					<View style={styles.stepContent}>
						<Text variant="h2">Select Restaurant</Text>
						<SearchBar
							value={restaurantSearch}
							onChangeText={setRestaurantSearch}
							placeholder="Search restaurants..."
						/>
						{/* Mock restaurant list */}
						{["Tsuta Ramen", "Sushi Saito", "Afuri Ebisu"].map((name) => (
							<Button
								key={name}
								variant={selectedRestaurant === name ? "primary" : "outline"}
								onPress={() => setSelectedRestaurant(name)}
							>
								{name}
							</Button>
						))}
						<Button
							variant="primary"
							size="lg"
							disabled={!selectedRestaurant}
							onPress={() => setStep(2)}
						>
							Next
						</Button>
					</View>
				)}

				{/* Step 2: Review type */}
				{step === 2 && (
					<View style={styles.stepContent}>
						<Text variant="h2">Review Type</Text>
						<Text variant="bodySm" style={styles.mutedText}>
							{selectedRestaurant}
						</Text>
						<Pill
							options={REVIEW_TYPES}
							selected={reviewType}
							onSelect={(v) => setReviewType(v as ReviewType)}
						/>
						<View style={styles.pointsPreview}>
							<Ionicons name="star" size={20} color={theme.colors.warning} />
							<Text variant="label">{POINTS_MAP[reviewType]} points</Text>
						</View>
						<View style={styles.navRow}>
							<Button variant="ghost" onPress={() => setStep(1)}>
								Back
							</Button>
							<Button variant="primary" onPress={() => setStep(3)}>
								Next
							</Button>
						</View>
					</View>
				)}

				{/* Step 3: Fill form */}
				{step === 3 && (
					<View style={styles.stepContent}>
						<Text variant="h2">Your Review</Text>
						<Text variant="bodySm" style={styles.mutedText}>
							{selectedRestaurant} \u00B7{" "}
							{REVIEW_TYPES.find((t) => t.value === reviewType)?.label}
						</Text>

						<View style={styles.field}>
							<Text variant="label">Rating</Text>
							<StarRating value={rating} onChange={setRating} size={32} />
						</View>

						{reviewType !== "check_in" && (
							<>
								<View style={styles.field}>
									<Text variant="label">Emojis</Text>
									<EmojiPicker selected={emojis} onToggle={handleEmojiToggle} />
								</View>

								{reviewType === "full_review" && (
									<View style={styles.field}>
										<Text variant="label">Your thoughts</Text>
										<TextInput
											style={styles.textArea}
											value={content}
											onChangeText={setContent}
											placeholder="What did you think?"
											placeholderTextColor={theme.colors.mutedForeground}
											multiline
											numberOfLines={4}
											textAlignVertical="top"
										/>
									</View>
								)}
							</>
						)}

						<View style={styles.navRow}>
							<Button variant="ghost" onPress={() => setStep(2)}>
								Back
							</Button>
							<Button
								variant="primary"
								disabled={rating === 0}
								onPress={handleSubmit}
							>
								Submit Review
							</Button>
						</View>
					</View>
				)}
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create((theme) => ({
	container: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	scroll: {
		padding: theme.spacing.md,
		paddingBottom: theme.spacing.xxl,
	},
	steps: {
		flexDirection: "row",
		justifyContent: "center",
		gap: theme.spacing.sm,
		marginBottom: theme.spacing.lg,
	},
	stepDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: theme.colors.grey200,
	},
	stepDotActive: {
		width: 24,
		backgroundColor: theme.colors.brand,
	},
	stepDotDone: {
		backgroundColor: theme.colors.brandDark,
	},
	stepContent: {
		gap: theme.spacing.md,
	},
	mutedText: {
		color: theme.colors.mutedForeground,
	},
	pointsPreview: {
		flexDirection: "row",
		alignItems: "center",
		gap: theme.spacing.sm,
		paddingVertical: theme.spacing.md,
		paddingHorizontal: theme.spacing.md,
		backgroundColor: `${theme.colors.warning}15`,
		borderRadius: theme.borderRadius.lg,
	},
	navRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: theme.spacing.md,
	},
	field: {
		gap: theme.spacing.sm,
	},
	textArea: {
		backgroundColor: theme.colors.surface,
		borderWidth: 1,
		borderColor: theme.colors.input,
		borderRadius: theme.borderRadius.lg,
		padding: theme.spacing.md,
		fontSize: theme.fontSize.base,
		fontFamily: theme.fonts.regular,
		color: theme.colors.foreground,
		minHeight: 120,
	},
	successContainer: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	successContent: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: theme.spacing.md,
		padding: theme.spacing.xl,
	},
	successIcon: {
		marginBottom: theme.spacing.md,
	},
	successText: {
		color: theme.colors.mutedForeground,
		textAlign: "center",
	},
}));

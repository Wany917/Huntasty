import { useEffect } from "react";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withSequence,
	withTiming,
} from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

interface PointsAnimationProps {
	points: number;
	visible: boolean;
	onComplete?: () => void;
}

export function PointsAnimation({
	points,
	visible,
	onComplete,
}: PointsAnimationProps) {
	const opacity = useSharedValue(0);
	const translateY = useSharedValue(0);
	const scale = useSharedValue(0.5);

	useEffect(() => {
		if (visible) {
			opacity.value = withSequence(
				withTiming(1, { duration: 200 }),
				withDelay(800, withTiming(0, { duration: 400 })),
			);
			translateY.value = withTiming(-60, { duration: 1400 });
			scale.value = withSequence(
				withTiming(1.2, { duration: 200 }),
				withTiming(1, { duration: 150 }),
			);

			const timer = setTimeout(() => {
				translateY.value = 0;
				scale.value = 0.5;
				onComplete?.();
			}, 1500);

			return () => clearTimeout(timer);
		}
	}, [visible, opacity, translateY, scale, onComplete]);

	const animatedStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
		transform: [{ translateY: translateY.value }, { scale: scale.value }],
	}));

	if (!visible) return null;

	return (
		<Animated.View style={[styles.container, animatedStyle]}>
			<Animated.Text style={styles.text}>+{points} pts</Animated.Text>
		</Animated.View>
	);
}

const styles = StyleSheet.create((theme) => ({
	container: {
		position: "absolute",
		alignSelf: "center",
		top: "40%",
		zIndex: 999,
	},
	text: {
		fontSize: theme.fontSize["4xl"],
		fontFamily: theme.fonts.bold,
		color: theme.colors.brand,
		textShadowColor: "rgba(0,0,0,0.2)",
		textShadowOffset: { width: 0, height: 2 },
		textShadowRadius: 4,
	},
}));

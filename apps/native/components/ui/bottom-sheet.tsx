import { type PropsWithChildren, useCallback, useEffect } from "react";
import { Dimensions, Pressable, View } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

interface BottomSheetProps extends PropsWithChildren {
	visible: boolean;
	onClose: () => void;
	snapPoint?: number; // fraction of screen height (default 0.5)
}

const SCREEN_HEIGHT = Dimensions.get("window").height;

export function BottomSheet({
	visible,
	onClose,
	snapPoint = 0.5,
	children,
}: BottomSheetProps) {
	const translateY = useSharedValue(SCREEN_HEIGHT);

	const open = useCallback(() => {
		translateY.value = withSpring(SCREEN_HEIGHT * (1 - snapPoint), {
			damping: 20,
			stiffness: 150,
		});
	}, [snapPoint, translateY]);

	const close = useCallback(() => {
		translateY.value = withSpring(SCREEN_HEIGHT, {
			damping: 20,
			stiffness: 150,
		});
	}, [translateY]);

	useEffect(() => {
		if (visible) {
			open();
		} else {
			close();
		}
	}, [visible, open, close]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }],
	}));

	if (!visible) return null;

	return (
		<View style={styles.overlay}>
			<Pressable style={styles.backdrop} onPress={onClose} />
			<Animated.View style={[styles.sheet, animatedStyle]}>
				<View style={styles.handle} />
				{children}
			</Animated.View>
		</View>
	);
}

const styles = StyleSheet.create((theme) => ({
	overlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 100,
	},
	backdrop: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.4)",
	},
	sheet: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		height: SCREEN_HEIGHT,
		backgroundColor: theme.colors.card,
		borderTopLeftRadius: theme.borderRadius.xl,
		borderTopRightRadius: theme.borderRadius.xl,
		paddingHorizontal: theme.spacing.md,
		paddingTop: theme.spacing.sm,
	},
	handle: {
		width: 40,
		height: 4,
		backgroundColor: theme.colors.grey200,
		borderRadius: theme.borderRadius.full,
		alignSelf: "center",
		marginBottom: theme.spacing.md,
	},
}));

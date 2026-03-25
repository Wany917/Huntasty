import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useState } from "react";
import { Dimensions, Pressable, View } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type TabIcon = React.ComponentProps<typeof Ionicons>["name"];

const TAB_ICONS: Record<string, { icon: TabIcon; activeIcon: TabIcon }> = {
	index: { icon: "home-outline", activeIcon: "home" },
	explore: { icon: "search-outline", activeIcon: "search" },
	hunt: { icon: "restaurant-outline", activeIcon: "restaurant" },
	leaderboard: { icon: "notifications-outline", activeIcon: "notifications" },
	profile: { icon: "person-outline", activeIcon: "person" },
};

const { width: SCREEN_W } = Dimensions.get("window");
const CENTER_BTN_SIZE = 56;
const NOTCH_CURVE_SIZE = 28;

export function TabBar({ state, navigation }: BottomTabBarProps) {
	const { theme } = useUnistyles();
	const insets = useSafeAreaInsets();
	const [expanded, setExpanded] = useState(false);

	const expandProgress = useSharedValue(0);
	const rotation = useSharedValue(0);

	const toggleExpand = () => {
		const next = !expanded;
		setExpanded(next);
		expandProgress.value = withSpring(next ? 1 : 0, {
			damping: 15,
			stiffness: 120,
		});
		rotation.value = withTiming(next ? 1 : 0, { duration: 250 });
	};

	const centerIconStyle = useAnimatedStyle(() => ({
		transform: [{ rotate: `${rotation.value * 45}deg` }],
	}));

	const leftActionStyle = useAnimatedStyle(() => ({
		opacity: expandProgress.value,
		transform: [
			{ translateY: (1 - expandProgress.value) * 30 },
			{ translateX: (1 - expandProgress.value) * 20 },
			{ scale: 0.5 + expandProgress.value * 0.5 },
		],
	}));

	const rightActionStyle = useAnimatedStyle(() => ({
		opacity: expandProgress.value,
		transform: [
			{ translateY: (1 - expandProgress.value) * 30 },
			{ translateX: -(1 - expandProgress.value) * 20 },
			{ scale: 0.5 + expandProgress.value * 0.5 },
		],
	}));

	const bottomPad = Math.max(insets.bottom, 8);

	// Split routes: left (before hunt) and right (after hunt)
	const huntIdx = Math.floor(state.routes.length / 2);
	const leftRoutes = state.routes.filter((_r, i) => i < huntIdx);
	const rightRoutes = state.routes.filter((_r, i) => i > huntIdx);

	const renderTab = (route: (typeof state.routes)[number], index: number) => {
		const icons = TAB_ICONS[route.name];
		if (!icons) return null;
		const focused = state.index === index;

		const onPress = () => {
			if (expanded) {
				setExpanded(false);
				expandProgress.value = withSpring(0);
				rotation.value = withTiming(0, { duration: 250 });
			}
			const event = navigation.emit({
				type: "tabPress",
				target: route.key,
				canPreventDefault: true,
			});
			if (!focused && !event.defaultPrevented) {
				navigation.navigate(route.name);
			}
		};

		return (
			<Pressable key={route.key} onPress={onPress} style={styles.tab}>
				<Ionicons
					name={focused ? icons.activeIcon : icons.icon}
					size={24}
					color={focused ? theme.colors.brand : theme.colors.grey400}
				/>
			</Pressable>
		);
	};

	return (
		<View style={styles.wrapper}>
			{/* Bar background */}
			<View style={[styles.bar, { paddingBottom: bottomPad }]}>
				{/* Concave notch curves — two background-colored circles
				    overlapping the bar top to create the concave illusion */}
				<View
					style={[
						styles.notchCurve,
						styles.notchCurveLeft,
						{ backgroundColor: theme.colors.background },
					]}
				/>
				<View
					style={[
						styles.notchCurve,
						styles.notchCurveRight,
						{ backgroundColor: theme.colors.background },
					]}
				/>

				{/* Tab icons row */}
				<View style={styles.tabRow}>
					<View style={styles.tabGroup}>
						{leftRoutes.map((route) =>
							renderTab(route, state.routes.indexOf(route)),
						)}
					</View>
					<View style={styles.centerSpacer} />
					<View style={styles.tabGroup}>
						{rightRoutes.map((route) =>
							renderTab(route, state.routes.indexOf(route)),
						)}
					</View>
				</View>
			</View>

			{/* Sub-action buttons (visible when expanded) */}
			{expanded && <Pressable style={styles.backdrop} onPress={toggleExpand} />}
			<Animated.View
				style={[styles.subAction, styles.subActionLeft, leftActionStyle]}
			>
				<Pressable
					style={styles.subActionBtn}
					onPress={() => {
						toggleExpand();
					}}
				>
					<Ionicons name="scan-outline" size={24} color="#FFFFFF" />
				</Pressable>
			</Animated.View>
			<Animated.View
				style={[styles.subAction, styles.subActionRight, rightActionStyle]}
			>
				<Pressable
					style={styles.subActionBtn}
					onPress={() => {
						toggleExpand();
						navigation.navigate("review/new");
					}}
				>
					<Ionicons name="create-outline" size={24} color="#FFFFFF" />
				</Pressable>
			</Animated.View>

			{/* Center floating button */}
			<View style={styles.centerBtnOuter}>
				<Pressable
					onPress={toggleExpand}
					style={(ps) => [
						styles.centerBtn,
						ps.pressed && styles.centerBtnPressed,
					]}
				>
					<Animated.View style={centerIconStyle}>
						<Ionicons
							name={expanded ? "close" : "restaurant"}
							size={24}
							color="#FFFFFF"
						/>
					</Animated.View>
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create((theme) => ({
	wrapper: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
	},
	bar: {
		backgroundColor: theme.colors.card,
		paddingTop: 14,
		shadowColor: "#95A8C3",
		shadowOffset: { width: 0, height: -10 },
		shadowOpacity: 0.15,
		shadowRadius: 40,
		elevation: 10,
		overflow: "visible",
	},
	notchCurve: {
		position: "absolute",
		top: -NOTCH_CURVE_SIZE,
		width: NOTCH_CURVE_SIZE,
		height: NOTCH_CURVE_SIZE,
		zIndex: 1,
	},
	notchCurveLeft: {
		left: SCREEN_W / 2 - CENTER_BTN_SIZE / 2 - NOTCH_CURVE_SIZE - 4,
		borderBottomRightRadius: NOTCH_CURVE_SIZE,
	},
	notchCurveRight: {
		left: SCREEN_W / 2 + CENTER_BTN_SIZE / 2 + 4,
		borderBottomLeftRadius: NOTCH_CURVE_SIZE,
	},
	tabRow: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: theme.spacing.md,
	},
	tabGroup: {
		flex: 1,
		flexDirection: "row",
		justifyContent: "space-around",
	},
	centerSpacer: {
		width: CENTER_BTN_SIZE + 32,
	},
	tab: {
		alignItems: "center",
		justifyContent: "center",
		padding: theme.spacing.sm,
	},
	centerBtnOuter: {
		position: "absolute",
		top: -(CENTER_BTN_SIZE / 2),
		left: SCREEN_W / 2 - CENTER_BTN_SIZE / 2,
		zIndex: 10,
	},
	centerBtn: {
		width: CENTER_BTN_SIZE,
		height: CENTER_BTN_SIZE,
		borderRadius: CENTER_BTN_SIZE / 2,
		backgroundColor: theme.colors.brandDark,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#042628",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	centerBtnPressed: {
		opacity: 0.85,
	},
	backdrop: {
		position: "absolute",
		top: -500,
		left: -50,
		right: -50,
		bottom: 0,
	},
	subAction: {
		position: "absolute",
		zIndex: 5,
		top: -(CENTER_BTN_SIZE / 2) - 68,
	},
	subActionLeft: {
		left: SCREEN_W / 2 - CENTER_BTN_SIZE / 2 - 68,
	},
	subActionRight: {
		left: SCREEN_W / 2 + CENTER_BTN_SIZE / 2 + 12,
	},
	subActionBtn: {
		width: 56,
		height: 56,
		borderRadius: theme.borderRadius.xl,
		backgroundColor: theme.colors.brand,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: theme.colors.brand,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 8,
		elevation: 6,
	},
}));

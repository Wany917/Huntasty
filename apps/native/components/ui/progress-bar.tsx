import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

interface ProgressBarProps {
	progress: number; // 0 to 1
	height?: number;
}

export function ProgressBar({ progress, height = 8 }: ProgressBarProps) {
	const clamped = Math.min(1, Math.max(0, progress));

	return (
		<View style={[styles.track, { height }]}>
			<View
				style={[
					styles.fill,
					{
						width: `${clamped * 100}%`,
						height,
					},
				]}
			/>
		</View>
	);
}

const styles = StyleSheet.create((theme) => ({
	track: {
		width: "100%",
		backgroundColor: theme.colors.muted,
		borderRadius: theme.borderRadius.full,
		overflow: "hidden",
	},
	fill: {
		backgroundColor: theme.colors.brand,
		borderRadius: theme.borderRadius.full,
	},
}));

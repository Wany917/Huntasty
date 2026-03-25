import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

interface StarRatingProps {
	value: number;
	onChange?: (value: number) => void;
	size?: number;
	readOnly?: boolean;
}

export function StarRating({
	value,
	onChange,
	size = 24,
	readOnly = false,
}: StarRatingProps) {
	const { theme } = useUnistyles();

	return (
		<View style={styles.container}>
			{[1, 2, 3, 4, 5].map((star) => {
				const filled = star <= value;
				const half = star - 0.5 <= value && star > value;
				const iconName = filled ? "star" : half ? "star-half" : "star-outline";

				return (
					<Pressable
						key={star}
						onPress={() => !readOnly && onChange?.(star)}
						disabled={readOnly}
						hitSlop={8}
					>
						<Ionicons
							name={iconName}
							size={size}
							color={
								filled || half ? theme.colors.warning : theme.colors.grey200
							}
						/>
					</Pressable>
				);
			})}
		</View>
	);
}

const styles = StyleSheet.create((_theme) => ({
	container: {
		flexDirection: "row",
		gap: 2,
	},
}));

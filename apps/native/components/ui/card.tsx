import { Image } from "expo-image";
import { View, type ViewProps } from "react-native";
import { StyleSheet } from "react-native-unistyles";

interface CardProps extends ViewProps {
	imageUri?: string;
	imageHeight?: number;
}

export function Card({
	imageUri,
	imageHeight = 160,
	children,
	style,
	...props
}: CardProps) {
	return (
		<View style={[styles.card, style]} {...props}>
			{imageUri && (
				<Image
					source={{ uri: imageUri }}
					style={[styles.image, { height: imageHeight }]}
					contentFit="cover"
					transition={200}
				/>
			)}
			<View style={styles.content}>{children}</View>
		</View>
	);
}

const styles = StyleSheet.create((theme) => ({
	card: {
		backgroundColor: theme.colors.card,
		borderRadius: theme.borderRadius.xl,
		overflow: "hidden",
		// Light mode: shadow. Dark mode: border.
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 3,
		borderWidth: theme.colors.background === "#0A2533" ? 1 : 0,
		borderColor: theme.colors.border,
	},
	image: {
		width: "100%",
	},
	content: {
		padding: theme.spacing.md,
	},
}));

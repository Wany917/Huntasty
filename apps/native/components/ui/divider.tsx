import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export function Divider() {
	return <View style={styles.line} />;
}

const styles = StyleSheet.create((theme) => ({
	line: {
		height: 1,
		backgroundColor: theme.colors.border,
	},
}));

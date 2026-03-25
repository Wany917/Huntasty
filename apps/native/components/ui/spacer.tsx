import { View } from "react-native";

interface SpacerProps {
	size?: number;
	flex?: boolean;
}

export function Spacer({ size, flex }: SpacerProps) {
	if (flex) {
		return <View style={{ flex: 1 }} />;
	}
	return <View style={{ height: size ?? 16, width: size ?? 16 }} />;
}

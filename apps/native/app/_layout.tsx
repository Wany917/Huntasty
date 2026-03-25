import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUnistyles } from "react-native-unistyles";

import { queryClient } from "@/utils/trpc";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const { theme } = useUnistyles();

	const [fontsLoaded] = useFonts({
		"SofiaPro-Regular": require("@/assets/fonts/SofiaPro-Regular.otf"),
		"SofiaPro-Medium": require("@/assets/fonts/SofiaPro-Medium.otf"),
		"SofiaPro-SemiBold": require("@/assets/fonts/SofiaPro-SemiBold.otf"),
		"SofiaPro-Bold": require("@/assets/fonts/SofiaPro-Bold.otf"),
	});

	useEffect(() => {
		if (fontsLoaded) {
			SplashScreen.hideAsync();
		}
	}, [fontsLoaded]);

	if (!fontsLoaded) {
		return null;
	}

	return (
		<QueryClientProvider client={queryClient}>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<Stack
					screenOptions={{
						headerStyle: {
							backgroundColor: theme.colors.background,
						},
						headerTitleStyle: {
							color: theme.colors.foreground,
							fontFamily: theme.fonts.bold,
						},
						headerTintColor: theme.colors.foreground,
					}}
				>
					<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
					<Stack.Screen
						name="restaurant/[id]"
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="review/new"
						options={{
							title: "New Review",
							presentation: "modal",
						}}
					/>
					<Stack.Screen
						name="modal"
						options={{ title: "Modal", presentation: "modal" }}
					/>
					<Stack.Screen
						name="(auth)/sign-in"
						options={{
							title: "Login",
							headerStyle: { backgroundColor: theme.colors.surface },
						}}
					/>
					<Stack.Screen
						name="(auth)/sign-up"
						options={{
							title: "Create Account",
							headerStyle: { backgroundColor: theme.colors.surface },
						}}
					/>
				</Stack>
			</GestureHandlerRootView>
		</QueryClientProvider>
	);
}

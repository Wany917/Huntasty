import { Tabs } from "expo-router";

import { TabBar } from "@/components/tab-bar";

export default function TabLayout() {
	return (
		<Tabs
			tabBar={(props) => <TabBar {...props} />}
			screenOptions={{ headerShown: false }}
		>
			<Tabs.Screen name="index" />
			<Tabs.Screen name="explore" />
			<Tabs.Screen name="hunt" />
			<Tabs.Screen name="leaderboard" />
			<Tabs.Screen name="profile" />
		</Tabs>
	);
}

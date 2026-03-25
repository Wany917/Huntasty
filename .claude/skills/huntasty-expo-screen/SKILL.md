---
name: huntasty-expo-screen
description: Creates mobile screens and components for Huntasty's Expo/React Native app. Use when user asks to "create a screen", "add a page", "build a component", or works on the mobile UI. Handles Expo Router, Unistyles, FlashList, expo-image, and Reanimated patterns.
---

# Huntasty Expo Screen

## Critical Rules

- Screens go in `apps/native/app/` (file-based routing via Expo Router)
- Components go in `apps/native/components/`
- One component per file, named export (NOT default export)
- Use `expo-image` for all images (NOT React Native Image)
- Use `FlashList` for all scrollable lists (NOT FlatList/ScrollView)
- Use `react-native-reanimated` for animations (NOT Animated API)
- TypeScript strict, no `any`

## Screen Template

```typescript
// apps/native/app/(tabs)/hunt.tsx
import { View, Text } from "react-native"
import { Stack } from "expo-router"

export default function HuntScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Hunt" }} />
      <View style={{ flex: 1 }}>
        <Text>Hunt Screen</Text>
      </View>
    </>
  )
}
```

## Component Template

```typescript
// apps/native/components/HunterCard.tsx
import { View, Text, Pressable } from "react-native"
import { Image } from "expo-image"
import { Link } from "expo-router"

interface HunterCardProps {
  id: string
  name: string
  level: string
  avatarUrl: string
  points: number
}

export function HunterCard({ id, name, level, avatarUrl, points }: HunterCardProps) {
  return (
    <Link href={`/hunter/${id}`} asChild>
      <Pressable>
        <View style={{ flexDirection: "row", alignItems: "center", padding: 12, gap: 12 }}>
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: 48, height: 48, borderRadius: 24 }}
            contentFit="cover"
            transition={200}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "600" }}>{name}</Text>
            <Text style={{ fontSize: 14, color: "#666" }}>{level} - {points} pts</Text>
          </View>
        </View>
      </Pressable>
    </Link>
  )
}
```

## Data Fetching with tRPC

```typescript
import { trpc } from "@/lib/trpc"

export function RestaurantList() {
  const { data, fetchNextPage, hasNextPage, isLoading } = trpc.restaurant.search.useInfiniteQuery(
    { limit: 20 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  )

  const restaurants = data?.pages.flatMap((p) => p.items) ?? []

  return (
    <FlashList
      data={restaurants}
      renderItem={({ item }) => <RestaurantCard restaurant={item} />}
      estimatedItemSize={80}
      onEndReached={() => hasNextPage && fetchNextPage()}
      onEndReachedThreshold={0.5}
    />
  )
}
```

## Navigation Structure

```
apps/native/app/
├── _layout.tsx              → Root layout (providers, auth check)
├── (auth)/                  → Auth group (login, register)
│   ├── _layout.tsx
│   ├── login.tsx
│   └── register.tsx
├── (tabs)/                  → Main tab navigation
│   ├── _layout.tsx          → Tab bar config
│   ├── hunt.tsx             → Home/feed
│   ├── map.tsx              → Map view
│   ├── carnet.tsx           → History
│   ├── social.tsx           → Clans, feed social
│   └── profile.tsx          → User profile
├── restaurant/[id].tsx      → Restaurant detail
├── hunter/[id].tsx          → Hunter profile
└── review/new.tsx           → Create review
```

## Tab Layout

```typescript
// apps/native/app/(tabs)/_layout.tsx
import { Tabs } from "expo-router"
import { Crosshair, Map, BookOpen, Users, User } from "lucide-react-native"

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "#FF6B35" }}>
      <Tabs.Screen name="hunt" options={{ title: "Hunt", tabBarIcon: ({ color }) => <Crosshair color={color} size={24} /> }} />
      <Tabs.Screen name="map" options={{ title: "Map", tabBarIcon: ({ color }) => <Map color={color} size={24} /> }} />
      <Tabs.Screen name="carnet" options={{ title: "Carnet", tabBarIcon: ({ color }) => <BookOpen color={color} size={24} /> }} />
      <Tabs.Screen name="social" options={{ title: "Social", tabBarIcon: ({ color }) => <Users color={color} size={24} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profil", tabBarIcon: ({ color }) => <User color={color} size={24} /> }} />
    </Tabs>
  )
}
```

## Optimistic Updates

For frequent actions (like, follow, favorite):

```typescript
const utils = trpc.useUtils()

const likeMutation = trpc.review.like.useMutation({
  onMutate: async ({ reviewId }) => {
    await utils.review.getByRestaurant.cancel()
    // Optimistically update the UI
  },
  onError: (err, vars, context) => {
    // Rollback on error
  },
  onSettled: () => {
    utils.review.getByRestaurant.invalidate()
  },
})
```

## Performance Checklist

- [ ] Lists use FlashList with `estimatedItemSize`
- [ ] Images use expo-image with `contentFit` and `transition`
- [ ] Heavy computations wrapped in `useMemo`
- [ ] Animations use Reanimated (UI thread)
- [ ] No inline styles in render loops (extract to StyleSheet or constants)

// Huntasty Design Tokens — from Figma "Component" page
// Font: Sofia Pro (loaded via expo-font)
// Figma color names mapped to semantic tokens

const sharedColors = {
	// Brand (from Figma: Brand/Primary, Brand/Secondary)
	brand: "#70B9BE", // Brand/Secondary — teal accent
	brandDark: "#042628", // Brand/Primary — deep navy (buttons, active tabs)
	brandLight: "#C6E3E5", // Accent/Accent 2

	// Semantic
	success: "#22C55E",
	destructive: "#EF4444",
	destructiveForeground: "#FFFFFF",
	warning: "#F59E0B",
	info: "#3B82F6",

	// Greyscale (from Figma: Neutral/)
	grey600: "#48525F",
	grey400: "#97A2B0", // Neutral/Grey 2
	grey200: "#E6EBF2", // Neutral/Grey 4 (borders, inactive tabs bg)
	grey100: "#F1F5F5",

	// Social
	google: "#E86143", // Figma: coral/red Google button
	apple: "#000000",
} as const;

export const lightTheme = {
	colors: {
		...sharedColors,
		typography: "#0A2533", // Neutral/Dark
		background: "#F1F5F5",
		foreground: "#0A2533", // Neutral/Dark
		card: "#FFFFFF", // Neutral/True White
		cardForeground: "#0A2533",
		primary: "#042628", // Brand/Primary — navy (buttons, active states)
		primaryForeground: "#FFFFFF", // Neutral/True White
		secondary: "#70B9BE", // Brand/Secondary — teal
		secondaryForeground: "#FFFFFF",
		muted: "#F1F5F5",
		mutedForeground: "#97A2B0", // Neutral/Grey 2
		accent: "#70B9BE",
		accentForeground: "#FFFFFF",
		border: "#E6EBF2", // Neutral/Grey 4
		input: "#E6EBF2", // Neutral/Grey 4 (input border)
		ring: "#70B9BE",
		navy: "#042628", // Brand/Primary
		navyLight: "#0A2533", // Neutral/Dark
		surface: "#FFFFFF",
	},
	fonts: {
		regular: "SofiaPro-Regular",
		medium: "SofiaPro-Medium",
		semiBold: "SofiaPro-SemiBold",
		bold: "SofiaPro-Bold",
	},
	spacing: {
		"2xs": 2,
		xs: 4,
		sm: 8,
		md: 16,
		lg: 24,
		xl: 32,
		xxl: 48,
	},
	borderRadius: {
		xs: 4,
		sm: 6,
		md: 8,
		lg: 12,
		xl: 16, // Figma standard radius for buttons, inputs, cards, tabs
		full: 9999,
	},
	fontSize: {
		xs: 12,
		sm: 14,
		base: 16,
		lg: 18,
		xl: 20,
		"2xl": 24,
		"3xl": 28,
		"4xl": 32,
	},
	lineHeight: {
		xs: 16,
		sm: 20, // 14 * 1.45
		base: 23, // 16 * 1.45
		lg: 20, // 18 * 1.1
		xl: 26, // 20 * 1.3
		"2xl": 32, // 24 * 1.35
		"3xl": 36,
		"4xl": 42,
	},
} as const;

export const darkTheme = {
	colors: {
		...sharedColors,
		typography: "#F1F5F5",
		background: "#0A2533",
		foreground: "#F1F5F5",
		card: "#122F3D",
		cardForeground: "#F1F5F5",
		primary: "#70B9BE", // In dark mode, use teal as primary (navy invisible on dark bg)
		primaryForeground: "#042628",
		secondary: "#1A3F50",
		secondaryForeground: "#C6E3E5",
		muted: "#122F3D",
		mutedForeground: "#97A2B0",
		accent: "#70B9BE",
		accentForeground: "#FFFFFF",
		border: "#1A3F50",
		input: "#1A3F50",
		ring: "#70B9BE",
		navy: "#70B9BE", // Swap to teal in dark mode for visibility
		navyLight: "#C6E3E5",
		surface: "#122F3D",
	},
	fonts: {
		regular: "SofiaPro-Regular",
		medium: "SofiaPro-Medium",
		semiBold: "SofiaPro-SemiBold",
		bold: "SofiaPro-Bold",
	},
	spacing: {
		"2xs": 2,
		xs: 4,
		sm: 8,
		md: 16,
		lg: 24,
		xl: 32,
		xxl: 48,
	},
	borderRadius: {
		xs: 4,
		sm: 6,
		md: 8,
		lg: 12,
		xl: 16,
		full: 9999,
	},
	fontSize: {
		xs: 12,
		sm: 14,
		base: 16,
		lg: 18,
		xl: 20,
		"2xl": 24,
		"3xl": 28,
		"4xl": 32,
	},
	lineHeight: {
		xs: 16,
		sm: 20,
		base: 23,
		lg: 20,
		xl: 26,
		"2xl": 32,
		"3xl": 36,
		"4xl": 42,
	},
} as const;

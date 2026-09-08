export const colors = {
  background: "#060608",
  backgroundElevated: "#0C0C12",
  surface: "rgba(255,255,255,0.045)",
  surfaceSolid: "#12121A",
  surfaceLight: "#1A1A26",
  gold: "#C9A962",
  goldLight: "#E8D5A3",
  goldDark: "#8B7340",
  primary: "#C9A962",
  accent: "#6B5CE7",
  accentSoft: "rgba(107,92,231,0.15)",
  text: "#F5F5F7",
  textSecondary: "#7A7A8C",
  textMuted: "#A8A8B8",
  success: "#34D399",
  warning: "#FBBF24",
  error: "#F87171",
  border: "rgba(255,255,255,0.07)",
  borderGold: "rgba(201,169,98,0.25)",
  overlay: "rgba(0,0,0,0.6)",
};

export const gradients = {
  hero: ["#141420", "#060608"] as const,
  card: ["rgba(201,169,98,0.12)", "rgba(255,255,255,0.03)"] as const,
  gold: ["#E8D5A3", "#C9A962", "#8B7340"] as const,
  accent: ["rgba(107,92,231,0.2)", "rgba(201,169,98,0.08)"] as const,
  button: ["#D4BC7A", "#C9A962", "#A08848"] as const,
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 40,
};

export const borderRadius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
};

export const typography = {
  hero: { fontSize: 34, fontWeight: "700" as const, letterSpacing: 1.2 },
  title: { fontSize: 26, fontWeight: "700" as const, letterSpacing: 0.5 },
  subtitle: { fontSize: 15, fontWeight: "400" as const, letterSpacing: 0.3 },
  body: { fontSize: 16, fontWeight: "400" as const },
  caption: { fontSize: 12, fontWeight: "500" as const, letterSpacing: 0.8 },
  label: { fontSize: 11, fontWeight: "600" as const, letterSpacing: 1.5, textTransform: "uppercase" as const },
};

export const shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: "#C9A962",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
};

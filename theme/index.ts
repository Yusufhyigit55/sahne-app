export const SCREEN_PADDING = 22;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  xxl: 32,
  section: 34,
} as const;

export const fontSize = {
  xs: 11,
  sm: 12.5,
  md: 14,
  lg: 15.5,
  xl: 17,
  xxl: 21,
  display: 26,
} as const;

export const lineHeight = {
  xs: 15,
  sm: 18,
  md: 21,
  lg: 23,
  xl: 24,
  xxl: 28,
  display: 32,
} as const;

export const fontWeight = {
  normal: "500",
  medium: "600",
  bold: "700",
  heavy: "800",
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 100,
} as const;

export const poster = {
  sm: { width: 104, height: 152 },
  md: { width: 112, height: 164 },
  lg: { width: 132, height: 193 },
  hero: { width: 104, height: 152 },
} as const;

export const touchTarget = 44;

export const shadow = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 8,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.38,
    shadowRadius: 20,
    elevation: 14,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.45,
    shadowRadius: 28,
    elevation: 20,
  },
} as const;
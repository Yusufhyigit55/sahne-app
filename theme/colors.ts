export type ThemeName = "dark" | "beige";

export type Palette = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  surfaceRaised: string;
  border: string;
  borderLight: string;
  text: string;
  textDim: string;
  textFaint: string;
  accent: string;
  accentText: string;
  accentSoft: string;
  warn: string;
  warnSoft: string;
  danger: string;
  dangerSoft: string;
  success: string;
  imdb: string;
  shadowColor: string;
};

const dark: Palette = {
  bg: "#0B0D0E",
  surface: "#15181A",
  surfaceAlt: "#1D2124",
  surfaceRaised: "#232729",
  border: "#252A2E",
  borderLight: "#32383C",
  text: "#F2F4F5",
  textDim: "#9BA3A8",
  textFaint: "#5F686D",
  accent: "#2DD4BF",
  accentText: "#04211D",
  accentSoft: "rgba(45, 212, 191, 0.14)",
  warn: "#FBBF24",
  warnSoft: "rgba(251, 191, 36, 0.14)",
  danger: "#F87171",
  dangerSoft: "rgba(248, 113, 113, 0.14)",
  success: "#4ADE80",
  imdb: "#F5C518",
  shadowColor: "#000000",
};

const beige: Palette = {
  bg: "#F7F4EE",
  surface: "#FFFFFF",
  surfaceAlt: "#F0EBE2",
  surfaceRaised: "#FFFFFF",
  border: "#E3DCD0",
  borderLight: "#F2EDE4",
  text: "#1C1A17",
  textDim: "#6B6560",
  textFaint: "#9C958D",
  accent: "#0D9488",
  accentText: "#FFFFFF",
  accentSoft: "rgba(13, 148, 136, 0.10)",
  warn: "#D97706",
  warnSoft: "rgba(217, 119, 6, 0.10)",
  danger: "#DC2626",
  dangerSoft: "rgba(220, 38, 38, 0.10)",
  success: "#059669",
  imdb: "#B8930F",
  shadowColor: "#2A241C",
};

export const themes: Record<ThemeName, Palette> = { dark, beige };
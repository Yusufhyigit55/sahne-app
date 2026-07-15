import { create } from "zustand";
import { themes, type Palette, type ThemeName } from "@/theme/colors";

type ThemeState = {
  name: ThemeName;
  colors: Palette;
  setTheme: (name: ThemeName) => void;
  toggleTheme: () => void;
};

export const useTheme = create<ThemeState>((set, get) => ({
  name: "dark",
  colors: themes.dark,

  setTheme: (name) => set({ name, colors: themes[name] }),

  toggleTheme: () => {
    const next: ThemeName = get().name === "dark" ? "beige" : "dark";
    set({ name: next, colors: themes[next] });
  },
}));
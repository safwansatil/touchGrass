import { create } from 'zustand'

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("touchGrass-theme") ||"lemonade",
  setTheme: (theme) => {
        localStorage.setItem("touchGrass-theme", theme);
        set({theme})
    }
}))
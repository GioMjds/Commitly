import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";
import { create } from "zustand";

type ThemeMode = "light" | "dark" | "system";

interface State {
    themeMode: ThemeMode;
    activeTheme: "light" | "dark";
    isInitialized: boolean;
    setThemeMode: (mode: ThemeMode) => Promise<void>;
    setActiveTheme: (theme: "light" | "dark") => void;
    loadThemePreference: () => Promise<void>;
    updateActiveThemeFromMode: () => void;
}

const THEME_STORAGE_KEY = "@commitly:theme_preference";

export const useThemeStore = create<State>((set, get) => ({
    themeMode: "system",
    activeTheme: "light",
    isInitialized: false,
    
    setThemeMode: async (mode: ThemeMode) => {
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
            set({ themeMode: mode });
            get().updateActiveThemeFromMode();
        } catch (error) {
            console.error("[ThemeStore] ❌ Failed to save theme preference:", error);
        }
    },
    
    setActiveTheme: (theme: "light" | "dark") => {
        const currentActive = get().activeTheme;
        if (currentActive === theme) return;

        set({ activeTheme: theme });
    },
    
    updateActiveThemeFromMode: () => {
        const { themeMode } = get();
        
        if (themeMode === 'system') {
            const systemTheme = Appearance.getColorScheme() || 'light';
            get().setActiveTheme(systemTheme);
        } else {
            get().setActiveTheme(themeMode);
        }
    },
    
    loadThemePreference: async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            
            if (savedTheme && (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system")) {
                set({ themeMode: savedTheme as ThemeMode, isInitialized: true });
                get().updateActiveThemeFromMode();
            } else {
                set({ isInitialized: true });
                get().updateActiveThemeFromMode();
            }
        } catch (error) {
            console.error("[ThemeStore] ❌ Failed to load theme preference:", error);
            set({ isInitialized: true });
        }
    },
}));
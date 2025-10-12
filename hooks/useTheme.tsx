import { useThemeStore } from '@/store/ThemeStore';
import { useEffect, useRef } from 'react';
import { Appearance } from 'react-native';

/**
 * Custom hook to manage theme based on user preference and system settings
 * Listens to system theme changes and applies the correct theme
 */
export const useTheme = () => {
    const { themeMode, activeTheme, isInitialized, setActiveTheme, loadThemePreference } = useThemeStore();
    const isFirstMount = useRef(true);

    useEffect(() => {
        if (isFirstMount.current && !isInitialized) {
            loadThemePreference();
            isFirstMount.current = false;
        }
    }, [isInitialized, loadThemePreference]);

    // Listen for system theme changes when in system mode
    useEffect(() => {
        if (!isInitialized) return;

        if (themeMode !== 'system') return;

        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            const systemTheme = colorScheme || 'light';
            setActiveTheme(systemTheme);
        });

        return () => subscription.remove();
    }, [themeMode, isInitialized, setActiveTheme, activeTheme]);

    return {
        activeTheme,
        themeMode,
        isDark: activeTheme === 'dark',
        isInitialized,
    };
};

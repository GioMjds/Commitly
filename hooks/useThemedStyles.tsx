import { useMemo } from 'react';
import { useTheme } from './useTheme';

/**
 * Hook to create themed styles that work in Expo Go
 * Returns style objects based on the current theme
 */
export const useThemedStyles = () => {
    const { isDark, activeTheme } = useTheme();

    const colors = useMemo(() => ({
        // Backgrounds
        background: isDark ? '#0B1220' : '#F8FAFC',
        surface: isDark ? '#0F172A' : '#FFFFFF',
        card: isDark ? '#111827' : '#FFFFFF',
        neutral: isDark ? '#1F2937' : '#E6EEF2',
        
        // Text
        text: isDark ? '#E6EEF2' : '#0F172A',
        textSecondary: isDark ? '#9CA3AF' : '#475569',
        textMuted: isDark ? '#9CA3AF' : '#64748b',
        
        // Borders
        border: isDark ? '#1F2937' : '#E6EEF2',
        borderLight: isDark ? '#374151' : '#F1F5F9',
        
        // Brand colors (same in both themes)
        primary: '#0F172A',
        secondary: '#0EA5A4',
        action: '#7C3AED',
        
        // Accents
        accent: isDark ? '#06B6D4' : '#334155',
        accentWeak: isDark ? '#7C3AED' : '#6366F1',
        
        // Status colors
        success: isDark ? '#34D399' : '#10B981',
        warning: isDark ? '#FBBF24' : '#F59E0B',
        danger: isDark ? '#F87171' : '#EF4444',
        
        // Opacity variants
        actionOpacity10: isDark ? 'rgba(124, 58, 237, 0.1)' : 'rgba(124, 58, 237, 0.1)',
        actionOpacity20: isDark ? 'rgba(124, 58, 237, 0.2)' : 'rgba(124, 58, 237, 0.2)',
        grayOpacity: isDark ? 'rgba(156, 163, 175, 0.1)' : 'rgba(243, 244, 246, 1)',
    }), [isDark]);

    const commonStyles = useMemo(() => ({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        surface: {
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 20,
        },
        card: {
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 16,
        },
        text: {
            color: colors.text,
        },
        textSecondary: {
            color: colors.textSecondary,
        },
        border: {
            borderColor: colors.border,
            borderWidth: 1,
        },
    }), [colors]);

    return {
        colors,
        commonStyles,
        isDark,
        activeTheme,
    };
};

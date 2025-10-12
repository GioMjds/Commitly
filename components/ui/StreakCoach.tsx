import StyledText from '@/components/ui/StyledText';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface StreakCoachProps {
    currentStreak: number;
    previousStreak: number;
    lastCommitDate: string | null;
}

export default function StreakCoach({ 
    currentStreak, 
    previousStreak,
    lastCommitDate 
}: StreakCoachProps) {
    const getCoachMessage = () => {
        const now = new Date();
        const today = now.toISOString().split('T')[0];

        // Streak broken
        if (previousStreak > 0 && currentStreak === 0) {
            return {
                emoji: '😔',
                title: 'Streak Lost',
                message: `Your ${previousStreak}-day streak ended. Don't worry! Every streak starts with a single commit. Let's rebuild together!`,
                color: 'bg-orange-500',
                icon: 'alert-circle' as const
            };
        }

        // No commit today yet
        if (lastCommitDate !== today && currentStreak > 0) {
            return {
                emoji: '⏰',
                title: 'Keep It Going!',
                message: `You're on a ${currentStreak}-day streak! Don't forget to commit today to keep the momentum.`,
                color: 'bg-yellow-500',
                icon: 'time' as const
            };
        }

        // First streak day
        if (currentStreak === 1 && lastCommitDate === today) {
            return {
                emoji: '🎉',
                title: 'Great Start!',
                message: 'You have started a new streak! Consistency is key to building great habits.',
                color: 'bg-green-500',
                icon: 'checkmark-circle' as const
            };
        }

        // Milestone streaks
        if (currentStreak === 7) {
            return {
                emoji: '🔥',
                title: 'One Week Strong!',
                message: 'Amazing! You have maintained a 7-day streak. Keep up the excellent work!',
                color: 'bg-indigo-600',
                icon: 'trophy' as const
            };
        }

        if (currentStreak === 30) {
            return {
                emoji: '🏆',
                title: 'One Month Champion!',
                message: 'Incredible dedication! A 30-day streak shows true commitment to growth.',
                color: 'bg-purple-600',
                icon: 'trophy' as const
            };
        }

        if (currentStreak === 100) {
            return {
                emoji: '💎',
                title: 'Century Club!',
                message: '100 days of consistent commits! You are an inspiration to all developers.',
                color: 'bg-cyan-600',
                icon: 'star' as const
            };
        }

        // Strong streak encouragement
        if (currentStreak >= 14) {
            return {
                emoji: '💪',
                title: 'Unstoppable!',
                message: `${currentStreak} days and counting! Your consistency is building incredible skills.`,
                color: 'bg-indigo-600',
                icon: 'flash' as const
            };
        }

        // Default encouragement
        if (currentStreak > 0 && lastCommitDate === today) {
            return {
                emoji: '✨',
                title: 'Looking Good!',
                message: `Day ${currentStreak} of your streak! Remember: small daily commits lead to big results.`,
                color: 'bg-teal-500',
                icon: 'trending-up' as const
            };
        }

        return null;
    };

    const coachMessage = getCoachMessage();

    if (!coachMessage) return null;

    const getBackgroundColor = (colorClass: string) => {
        switch (colorClass) {
            case 'bg-orange-500': return '#f97316';
            case 'bg-yellow-500': return '#eab308';
            case 'bg-green-500': return '#22c55e';
            case 'bg-indigo-600': return '#4f46e5';
            case 'bg-purple-600': return '#9333ea';
            case 'bg-cyan-600': return '#0891b2';
            case 'bg-teal-500': return '#14b8a6';
            default: return '#4f46e5';
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: getBackgroundColor(coachMessage.color) }]}>
            <View style={styles.contentRow}>
                <View style={styles.emojiContainer}>
                    <StyledText style={styles.emoji}>{coachMessage.emoji}</StyledText>
                </View>
                <View style={styles.textContainer}>
                    <View style={styles.titleRow}>
                        <Ionicons name={coachMessage.icon} size={18} color="#fff" />
                        <StyledText variant="extrabold" style={styles.title}>
                            {coachMessage.title}
                        </StyledText>
                    </View>
                    <StyledText variant="medium" style={styles.message}>
                        {coachMessage.message}
                    </StyledText>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    emojiContainer: {
        marginRight: 12,
    },
    emoji: {
        fontSize: 36,
    },
    textContainer: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        color: '#fff',
        marginLeft: 8,
        fontSize: 18,
    },
    message: {
        color: '#FAFAFA',
        fontSize: 18,
    },
});

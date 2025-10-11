import StyledText from '@/components/ui/StyledText';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

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

    return (
        <View className={`${coachMessage.color} rounded-2xl p-4 mb-4 shadow-sm`}>
            <View className="flex-row items-start">
                <View className="mr-3">
                    <StyledText className="text-4xl">{coachMessage.emoji}</StyledText>
                </View>
                <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                        <Ionicons name={coachMessage.icon} size={18} color="#fff" />
                        <StyledText variant="extrabold" className="text-white ml-2 text-lg">
                            {coachMessage.title}
                        </StyledText>
                    </View>
                    <StyledText variant="medium" className="text-neutral text-lg">
                        {coachMessage.message}
                    </StyledText>
                </View>
            </View>
        </View>
    );
}

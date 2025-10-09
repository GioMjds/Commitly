import StyledText from '@/components/ui/StyledText';
import { DashboardStats } from '@/types/Commit.types';
import React from 'react';
import { View } from 'react-native';

type Props = {
    stats: DashboardStats;
};

export default function StatsOverview({ stats }: Props) {
    return (
        <View className="mb-6">
            <StyledText
                variant="semibold"
                className="text-primary text-xl mb-3"
            >
                Your Stats
            </StyledText>
            <View className="bg-white rounded-2xl p-5 shadow-md">
                <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-gray-200">
                    <StyledText
                        variant="medium"
                        className="text-primary/70"
                    >
                        Total Commits
                    </StyledText>
                    <StyledText
                        variant="extrabold"
                        className="text-action text-3xl"
                    >
                        {stats.totalCommits}
                    </StyledText>
                </View>
                <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                        <StyledText
                            variant="medium"
                            className="text-primary/70 mb-1"
                        >
                            Current Streak
                        </StyledText>
                        <View className="flex-row items-center">
                            <StyledText
                                variant="extrabold"
                                className="text-action text-2xl mr-1"
                            >
                                {stats.currentStreak}
                            </StyledText>
                            <StyledText className="text-xl">
                                🔥
                            </StyledText>
                        </View>
                    </View>
                    <View className="flex-1 items-end">
                        <StyledText
                            variant="medium"
                            className="text-primary/70 mb-1"
                        >
                            Best Streak
                        </StyledText>
                        <View className="flex-row items-center">
                            <StyledText
                                variant="extrabold"
                                className="text-secondary text-2xl mr-1"
                            >
                                {stats.longestStreak}
                            </StyledText>
                            <StyledText className="text-xl">
                                🏆
                            </StyledText>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

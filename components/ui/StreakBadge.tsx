import StyledText from "@/components/ui/StyledText";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { View } from "react-native";

interface StreakBadgeProps {
    currentStreak: number;
    longestStreak: number;
}

export default function StreakBadge({ currentStreak, longestStreak }: StreakBadgeProps) {
    const [prevStreak, setPrevStreak] = useState<number>(currentStreak);

    useEffect(() => {
        if (currentStreak > prevStreak && currentStreak > 0) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        setPrevStreak(currentStreak);
    }, [currentStreak, prevStreak]);

    return (
        <View className="bg-indigo-600 rounded-3xl p-6 shadow-lg">
            {/* Current Streak Display */}
            <View className="mb-4">
                <View className="inline">
                    <StyledText variant="black" className="text-gray-100 text-9xl">
                        {currentStreak}
                    </StyledText>
                    <StyledText variant="medium" className="text-gray-100 text-xl mt-1">
                        Current Streak (days)
                    </StyledText>
                </View>
            </View>

            {/* Longest Streak */}
            {longestStreak > 0 && (
                <View className="bg-primary/30 rounded-2xl p-3 mt-2 border border-neutral/10">
                    <View className="flex-row justify-between items-center">
                        <StyledText variant="medium" className="text-neutral">
                            Best Streak
                        </StyledText>
                        <View className="flex-row items-center">
                            <StyledText variant="extrabold" className="text-neutral text-xl mr-1">
                                {longestStreak}
                            </StyledText>
                            <StyledText className="text-lg">🏆</StyledText>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
}
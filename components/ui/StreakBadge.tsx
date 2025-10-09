import StyledText from "@/components/ui/StyledText";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { View } from "react-native";

interface StreakBadgeProps {
    currentStreak: number;
    longestStreak: number;
}

export default function StreakBadge({ currentStreak, longestStreak }: StreakBadgeProps) {
    const [showAnimation, setShowAnimation] = useState<boolean>(false);
    const [prevStreak, setPrevStreak] = useState<number>(currentStreak);

    useEffect(() => {
        if (currentStreak > prevStreak && currentStreak > 0) {
            setShowAnimation(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            setTimeout(() => {
                setShowAnimation(false);
            }, 2000);
        }
        setPrevStreak(currentStreak);
    }, [currentStreak, prevStreak]);

    const getStreakEmoji = () => {
        if (currentStreak === 0) return "⚪";
        if (currentStreak < 3) return "🔥";
        if (currentStreak < 7) return "🔥🔥";
        if (currentStreak < 14) return "🔥🔥🔥";
        if (currentStreak < 30) return "⭐🔥⭐";
        return "🏆🔥🏆";
    };

    return (
        <View className="bg-indigo-600 rounded-3xl p-6 shadow-lg">
            {/* Current Streak Display */}
            <View className="mb-4">
                <StyledText variant="medium" className="text-gray-100 text-xl mb-1">
                    Current Streak (days)
                </StyledText>
                <View className="flex-row items-center">
                    <StyledText variant="black" className="text-gray-100 text-8xl">
                        {currentStreak}
                    </StyledText>
                    <StyledText className="text-4xl ml-2">{getStreakEmoji()}</StyledText>
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

            {/* Celebration Animation */}
            {showAnimation && (
                <View className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center">
                    <StyledText className="text-6xl">🎉</StyledText>
                </View>
            )}
        </View>
    );
}
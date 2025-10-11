import StyledText from '@/components/ui/StyledText';
import { DashboardStats } from '@/types/Commit.types';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

type StreakBadgeProps = {
	stats: DashboardStats;
};

export default function StreakBadge({ stats }: StreakBadgeProps) {
	const { currentStreak, longestStreak, totalCommits } = stats;
	const [prevStreak, setPrevStreak] = useState<number>(currentStreak);

	useEffect(() => {
		if (currentStreak > prevStreak && currentStreak > 0) {
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
		}
		setPrevStreak(currentStreak);
	}, [currentStreak, prevStreak]);

	return (
		<View className="flex-col gap-4 mb-4">
			{/* Big Streak Badge */}
			<View className="bg-indigo-600 rounded-3xl p-6 shadow-lg">
				<View className="inline">
					<StyledText
						variant="black"
						className="text-neutral text-9xl"
					>
						{totalCommits}
					</StyledText>
					<StyledText
						variant="medium"
						className="text-neutral text-2xl mt-1"
					>
						Total Commits
					</StyledText>
				</View>
			</View>

			{/* Cards */}
			<View className="flex-row flex-1 items-center justify-center gap-4">
				{/* Current Streak */}
				<View className="flex-1 bg-orange-600 rounded-3xl p-6 shadow-lg">
					<View className="flex-1">
						<View className="flex-row items-center">
							<StyledText
								variant="extrabold"
								className="text-neutral text-5xl mr-2"
							>
								{currentStreak}
							</StyledText>
						</View>
						<StyledText
							variant="medium"
							className="text-neutral text-xl mt-2"
						>
							Current Streak
						</StyledText>
					</View>
				</View>

				{/* Best Streak */}
				<View className="flex-1 bg-secondary rounded-3xl p-6 shadow-lg">
					<View className="flex-1">
						<View className="flex-row items-center">
							<StyledText
								variant="extrabold"
								className="text-neutral text-5xl mr-2"
							>
								{longestStreak}
							</StyledText>
						</View>
						<StyledText
							variant="medium"
							className="text-neutral text-xl mt-2"
						>
							Best Streak
						</StyledText>
					</View>
				</View>
			</View>
		</View>
	);
}

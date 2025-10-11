import Header from '@/components/layout/Header';
import CommitCalendar from '@/components/ui/CommitCalendar';
import StreakBadge from '@/components/ui/StreakBadge';
import StreakCoach from '@/components/ui/StreakCoach';
import StyledText from '@/components/ui/StyledText';
import { useCommit } from '@/hooks/useCommit';
import { useStreak } from '@/hooks/useStreak';
import { useAuthStore } from '@/store/AuthStore';
import { useCommitStore } from '@/store/CommitStore';
import { DashboardStats, MoodType } from '@/types/Commit.types';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	ActivityIndicator,
	ScrollView,
	TouchableOpacity,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
	const { user } = useAuthStore();
	const { commits, streakData, loading } = useCommitStore();
	const { fetchCommits } = useCommit();

	useStreak();

	const [previousStreak, setPreviousStreak] = useState(streakData.currentStreak);

	useEffect(() => {
		if (streakData.currentStreak !== previousStreak) {
			setPreviousStreak(streakData.currentStreak);
		}
	}, [streakData.currentStreak, previousStreak]);

	// Check if user is signed in with GitHub
	const isGitHubUser = user?.providerData?.some(
		(provider) => provider.providerId === 'github.com'
	);

	useFocusEffect(
		useCallback(() => {
			if (user) {
				fetchCommits();
			}
		}, [user, fetchCommits])
	);

	const stats: DashboardStats = useMemo(() => {
		const totalCommits = commits.length;

		const tagCounts: Record<string, number> = {};
		commits.forEach((commit) => {
			if (commit.tag) {
				tagCounts[commit.tag] = (tagCounts[commit.tag] || 0) + 1;
			}
		});

		const topTags = Object.entries(tagCounts)
			.map(([tag, count]) => ({ tag, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 5);

		// Calculate mood trend
		const moodCounts: Record<MoodType, number> = {
			'😄': 0,
			'😊': 0,
			'😐': 0,
			'😔': 0,
			'😞': 0,
		};

		commits.forEach((commit) => {
			if (commit.mood) {
				moodCounts[commit.mood as MoodType] =
					(moodCounts[commit.mood as MoodType] || 0) + 1;
			}
		});

		const moodTrend = Object.entries(moodCounts)
			.map(([mood, count]) => ({ mood: mood as MoodType, count }))
			.filter((item) => item.count > 0)
			.sort((a, b) => b.count - a.count);

		return {
			totalCommits,
			currentStreak: streakData.currentStreak,
			longestStreak: streakData.longestStreak,
			topTags,
			moodTrend,
		};
	}, [commits, streakData]);

	if (loading && commits.length === 0) {
		return (
			<SafeAreaView className="flex-1 bg-neutral justify-center items-center">
				<ActivityIndicator size="large" color="#0891b2" />
				<StyledText variant="medium" className="text-primary mt-4">
					Loading your data...
				</StyledText>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 p-6 bg-neutral">
			{/* Header */}
			<View className="flex-row justify-between items-center mb-4">
				<View className="flex-1">
					<Header 
						title="Dashboard" 
						subtitle="Track your progress and stay consistent" 
					/>
				</View>
			</View>

			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
			>
				<StreakBadge stats={stats} />

				{/* Streak Coach */}
				<StreakCoach 
					currentStreak={streakData.currentStreak} 
					previousStreak={previousStreak}
					lastCommitDate={streakData.lastCommitDate}
				/>

				{/* Commit Calendar */}
				<CommitCalendar commits={commits} />

				{/* Empty State */}
				{commits.length === 0 && (
					<View className="items-center py-12">
						{!isGitHubUser && (
							<>
								<StyledText className="text-6xl mb-4">🔗</StyledText>
								<StyledText
									variant="semibold"
									className="text-primary text-2xl mb-2"
								>
									Connect GitHub
								</StyledText>
								<StyledText
									variant="light"
									className="text-primary/60 text-center mb-6 px-8"
								>
									Sign in with GitHub to automatically track your coding commits and build your streak!
								</StyledText>
								<TouchableOpacity
									onPress={() => router.push('/settings')}
									className="bg-action rounded-2xl px-6 py-3"
								>
									<StyledText
										variant="semibold"
										className="text-white text-lg"
									>
										Go to Settings
									</StyledText>
								</TouchableOpacity>
							</>
						)}
					</View>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}

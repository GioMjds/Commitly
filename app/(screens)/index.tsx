import Header from '@/components/layout/Header';
import StreakBadge from '@/components/ui/StreakBadge';
import StyledText from '@/components/ui/StyledText';
import { useCommit } from '@/hooks/useCommit';
import { useGithubCommits } from '@/hooks/useGithubCommits';
import { useStreak } from '@/hooks/useStreak';
import { useAuthStore } from '@/store/AuthStore';
import { useCommitStore } from '@/store/CommitStore';
import { DashboardStats, MoodType } from '@/types/Commit.types';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo } from 'react';
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
	const { syncGithubCommits, loading: syncLoading } = useGithubCommits();

	useStreak();

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

	const handleQuickSync = async () => {
		const result = await syncGithubCommits();
		if (result.success) {
			await fetchCommits();
		}
	};

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
				{/* Streak Badge */}
				<View className="mb-6">
					<StreakBadge
						currentStreak={stats.currentStreak}
						longestStreak={stats.longestStreak}
					/>
				</View>

				{/* Stats Overview */}
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

				{/* Mood Trend */}
				{stats.moodTrend.length > 0 && (
					<View className="mb-6">
						<StyledText
							variant="semibold"
							className="text-primary text-xl mb-3"
						>
							Mood Overview
						</StyledText>
						<View className="bg-white rounded-2xl p-4 shadow-md">
							{stats.moodTrend.map((item, index) => (
								<View
									key={item.mood}
									className={`flex-row justify-between items-center py-3 ${
										index !== stats.moodTrend.length - 1
											? 'border-b border-gray-200'
											: ''
									}`}
								>
									<View className="flex-row items-center">
										<StyledText className="text-3xl mr-3">
											{item.mood}
										</StyledText>
									</View>
									<View className="flex-1">
										<View className="bg-action/20 rounded-full h-3 overflow-hidden">
											<View
												className="bg-action h-full rounded-full"
												style={{
													width: `${(item.count / stats.totalCommits) * 100}%`,
												}}
											/>
										</View>
									</View>
									<StyledText
										variant="semibold"
										className="text-primary ml-3 w-12 text-right"
									>
										{item.count}
									</StyledText>
								</View>
							))}
						</View>
					</View>
				)}

				{/* Empty State */}
				{commits.length === 0 && (
					<View className="items-center py-12">
						{isGitHubUser ? (
							<>
								<Ionicons name="logo-github" size={80} color="#7C3AED" />
								<StyledText
									variant="semibold"
									className="text-primary text-2xl mb-2 mt-4"
								>
									Ready to sync!
								</StyledText>
								<StyledText
									variant="light"
									className="text-primary/60 text-center mb-6 px-8"
								>
									Your GitHub activity will automatically appear here. Sync now to get started!
								</StyledText>
								<TouchableOpacity
									onPress={handleQuickSync}
									disabled={syncLoading}
									className="bg-action rounded-2xl px-6 py-3 flex-row items-center"
								>
									{syncLoading ? (
										<ActivityIndicator size="small" color="#ffffff" />
									) : (
										<>
											<Ionicons name="sync" size={20} color="#ffffff" />
											<StyledText
												variant="semibold"
												className="text-white text-lg ml-2"
											>
												Sync GitHub Commits
											</StyledText>
										</>
									)}
								</TouchableOpacity>
							</>
						) : (
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

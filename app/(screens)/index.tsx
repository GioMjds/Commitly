import Header from '@/components/layout/Header';
import CommitCalendar from '@/components/ui/CommitCalendar';
import StreakBadge from '@/components/ui/StreakBadge';
import StreakCoach from '@/components/ui/StreakCoach';
import StyledText from '@/components/ui/StyledText';
import { useCommit } from '@/hooks/useCommit';
import { useStreak } from '@/hooks/useStreak';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useAuthStore } from '@/store/AuthStore';
import { useCommitStore } from '@/store/CommitStore';
import { DashboardStats } from '@/types/Commit.types';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
	const user = useAuthStore((state) => state.user);
	const { commits, streakData, loading } = useCommitStore();
	const { fetchCommits } = useCommit();
	const { colors } = useThemedStyles();

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
			if (user) fetchCommits();
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

		return {
			totalCommits,
			currentStreak: streakData.currentStreak,
			longestStreak: streakData.longestStreak,
		};
	}, [commits, streakData]);

	if (loading && commits.length === 0) {
		return (
			<SafeAreaView style={[styles.container, styles.centerContent, { backgroundColor: colors.neutral }]}>
				<ActivityIndicator size="large" color="#0891b2" />
				<StyledText variant="medium" style={[styles.loadingText, { color: colors.text }]}>
					Loading your data...
				</StyledText>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: colors.neutral }]}>
			{/* Header */}
			<View style={styles.headerContainer}>
				<View style={styles.headerContent}>
					<Header 
						title="Dashboard" 
						subtitle="Track your progress and stay consistent" 
					/>
				</View>
			</View>

			<ScrollView
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
					<View style={styles.emptyState}>
						{!isGitHubUser && (
							<>
								<StyledText style={styles.emptyStateEmoji}>🔗</StyledText>
								<StyledText
									variant="semibold"
									style={[styles.emptyStateTitle, { color: colors.text }]}
								>
									Connect GitHub
								</StyledText>
								<StyledText
									variant="light"
									style={[styles.emptyStateMessage, { color: colors.textMuted }]}
								>
									Sign in with GitHub to automatically track your coding commits and build your streak!
								</StyledText>
								<TouchableOpacity
									onPress={() => router.push('/settings')}
									style={styles.emptyStateButton}
								>
									<StyledText
										variant="semibold"
										style={styles.emptyStateButtonText}
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

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 24,
	},
	centerContent: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingText: {
		marginTop: 16,
	},
	headerContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	headerContent: {
		flex: 1,
	},
	emptyState: {
		alignItems: 'center',
		paddingVertical: 48,
	},
	emptyStateEmoji: {
		fontSize: 64,
		marginBottom: 16,
	},
	emptyStateTitle: {
		fontSize: 24,
		marginBottom: 8,
	},
	emptyStateMessage: {
		textAlign: 'center',
		marginBottom: 24,
		paddingHorizontal: 32,
		opacity: 0.6,
	},
	emptyStateButton: {
		backgroundColor: '#7C3AED',
		borderRadius: 16,
		paddingHorizontal: 24,
		paddingVertical: 12,
	},
	emptyStateButtonText: {
		color: '#fff',
		fontSize: 18,
	},
});

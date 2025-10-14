import StyledText from '@/components/ui/StyledText';
import { DashboardStats } from '@/types/Commit.types';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

type StreakBadgeProps = {
	stats: DashboardStats;
};

export default function StreakBadge({ stats }: StreakBadgeProps) {
	const { currentStreak, longestStreak, totalCommits } = stats;
	const [prevStreak, setPrevStreak] = useState<number>(currentStreak);

	useEffect(() => {
		setPrevStreak(currentStreak);
	}, [currentStreak, prevStreak]);

	return (
		<View style={styles.container}>
			{/* Big Streak Badge */}
			<View style={styles.totalCommitsCard}>
				<View>
					<StyledText
						variant="black"
						style={styles.totalCommitsNumber}
					>
						{totalCommits}
					</StyledText>
					<StyledText
						variant="medium"
						style={styles.totalCommitsLabel}
					>
						Total Commits
					</StyledText>
				</View>
			</View>

			{/* Cards */}
			<View style={styles.streaksRow}>
				{/* Current Streak */}
				<View style={styles.currentStreakCard}>
					<View style={styles.cardContent}>
						<View style={styles.numberRow}>
							<StyledText
								variant="extrabold"
								style={styles.streakNumber}
							>
								{currentStreak}
							</StyledText>
						</View>
						<StyledText
							variant="medium"
							style={styles.streakLabel}
						>
							Current Streak
						</StyledText>
					</View>
				</View>

				{/* Best Streak */}
				<View style={styles.bestStreakCard}>
					<View style={styles.cardContent}>
						<View style={styles.numberRow}>
							<StyledText
								variant="extrabold"
								style={styles.streakNumber}
							>
								{longestStreak}
							</StyledText>
						</View>
						<StyledText
							variant="medium"
							style={styles.streakLabel}
						>
							Best Streak
						</StyledText>
					</View>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'column',
		gap: 16,
		marginBottom: 16,
	},
	totalCommitsCard: {
		backgroundColor: '#4f46e5',
		borderRadius: 24,
		padding: 24,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	totalCommitsNumber: {
		color: '#FAFAFA',
		fontSize: 96,
	},
	totalCommitsLabel: {
		color: '#FAFAFA',
		fontSize: 24,
		marginTop: 4,
	},
	streaksRow: {
		flexDirection: 'row',
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 16,
	},
	currentStreakCard: {
		flex: 1,
		backgroundColor: '#ea580c',
		borderRadius: 24,
		padding: 24,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	bestStreakCard: {
		flex: 1,
		backgroundColor: '#0EA5A4',
		borderRadius: 24,
		padding: 24,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	cardContent: {
		flex: 1,
	},
	numberRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	streakNumber: {
		color: '#FAFAFA',
		fontSize: 48,
		marginRight: 8,
	},
	streakLabel: {
		color: '#FAFAFA',
		fontSize: 20,
		marginTop: 8,
	},
});

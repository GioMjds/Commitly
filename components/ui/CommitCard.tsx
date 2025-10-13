import StyledText from '@/components/ui/StyledText';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { DailyCommit } from '@/types/Commit.types';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Linking, StyleSheet, TouchableOpacity, View } from 'react-native';

interface CommitCardProps {
	commit: DailyCommit;
}

export default function CommitCard({ commit }: CommitCardProps) {
	const [expanded, setExpanded] = useState<boolean>(false);
	const { colors } = useThemedStyles();

	const isGitHubSync = commit.tag === 'github-sync';
	const hasGitHubCommits =
		commit.githubCommits && commit.githubCommits.length > 0;
	const isManualCommit =
		commit.title ||
		commit.timeSpent ||
		commit.difficulty ||
		commit.description;

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString('en-US', {
			weekday: 'short',
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	const formatTime = (date: Date) => {
		return new Date(date).toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const formatTimeSpent = (minutes: number) => {
		if (minutes < 60) {
			return `${minutes}m`;
		}
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
	};

	const getDifficultyIcon = (difficulty: string) => {
		switch (difficulty) {
			case 'easy':
				return '😊';
			case 'medium':
				return '😐';
			case 'hard':
				return '😰';
			default:
				return '';
		}
	};

	const getDifficultyTextColor = (difficulty: string) => {
		switch (difficulty) {
			case 'easy':
				return '#22c55e';
			case 'medium':
				return '#eab308';
			case 'hard':
				return '#ef4444';
			default:
				return '#6b7280'; // fallback gray
		}
	};

	const openGitHubUrl = (url: string) => {
		Linking.openURL(url);
	};

	return (
		<View style={[styles.card, { backgroundColor: colors.surface }]}>
			{/* Header with date and actions */}
			<View style={styles.header}>
				<View style={styles.headerContent}>
					<View style={styles.titleRow}>
						<StyledText
							variant="semibold"
							style={[styles.dateText, { color: colors.text }]}
						>
							{formatDate(commit.createdAt)}
						</StyledText>
						{isGitHubSync && (
							<View style={styles.githubSyncBadge}>
								<Ionicons
									name="logo-github"
									size={12}
									color="#7C3AED"
								/>
							</View>
						)}
						{isManualCommit && (
							<View style={styles.manualBadge}>
								<Ionicons
									name="create"
									size={12}
									color="#0EA5A4"
								/>
							</View>
						)}
					</View>
					<StyledText
						variant="light"
						style={[styles.timeText, { color: colors.textMuted }]}
					>
						{formatTime(commit.createdAt)}
					</StyledText>
				</View>
			</View>

			{/* Manual Commit Details */}
			{isManualCommit && (
				<View style={[styles.manualSection, { backgroundColor: colors.card }]}>
					{/* Title */}
					{commit.title && (
						<StyledText
							variant="semibold"
							style={[styles.manualTitle, { color: colors.text }]}
						>
							{commit.title}
						</StyledText>
					)}

					{/* Time Spent & Difficulty */}
					<View style={styles.metaRow}>
						{commit.timeSpent && (
							<View style={styles.timeSpentBadge}>
								<Ionicons
									name="time"
									size={14}
									color="#7C3AED"
								/>
								<StyledText
									variant="medium"
									style={styles.timeSpentText}
								>
									{formatTimeSpent(commit.timeSpent)}
								</StyledText>
							</View>
						)}
						{commit.difficulty && (
							<View style={[styles.difficultyBadge]}>
								<StyledText style={styles.difficultyEmoji}>
									{getDifficultyIcon(commit.difficulty)}
								</StyledText>
								<StyledText
									variant="semibold"
									style={[
										styles.difficultyText,
										{ color: getDifficultyTextColor(commit.difficulty) }
									]}
								>
									{commit.difficulty}
								</StyledText>
							</View>
						)}
					</View>

					{/* Description */}
					{commit.description && (
						<StyledText
							variant="regular"
							style={[styles.description, { color: colors.text }]}
						>
							{commit.description}
						</StyledText>
					)}
				</View>
			)}

			{/* GitHub Commits Details */}
			{hasGitHubCommits && (
				<View style={styles.githubSection}>
					<TouchableOpacity
						onPress={() => setExpanded(!expanded)}
						style={[styles.expandButton, { backgroundColor: colors.card }]}
					>
						<View style={styles.expandButtonContent}>
							<Ionicons
								name="git-commit"
								size={20}
								color="#7C3AED"
							/>
							<StyledText
								variant="semibold"
								style={{ color: colors.text }}
							>
								{commit.githubCommits!.length} GitHub{' '}
								{commit.githubCommits!.length === 1
									? 'Commit'
									: 'Commits'}
							</StyledText>
						</View>
						<Ionicons
							name={expanded ? 'chevron-up' : 'chevron-down'}
							size={20}
							color="#7C3AED"
						/>
					</TouchableOpacity>

					{expanded && (
						<View style={styles.expandedContent}>
							{commit.githubCommits!.map((ghCommit) => (
								<View
									key={ghCommit.sha}
									style={[styles.githubCommit, { 
										backgroundColor: colors.background,
										borderLeftColor: colors.action 
									}]}
								>
									{/* Repository Name */}
									<View style={styles.repoRow}>
										<Ionicons
											name="folder"
											size={14}
											color={colors.action}
										/>
										<StyledText
											variant="semibold"
											style={[styles.repoText, { color: colors.text }]}
										>
											{ghCommit.repo}
										</StyledText>
									</View>

									{/* Commit Message */}
									<StyledText
										variant="regular"
										style={[styles.commitMessage, { color: colors.text }]}
									>
										{ghCommit.message.split('\n')[0]}
									</StyledText>

									{/* SHA and Date */}
									<View style={styles.commitFooter}>
										<View style={styles.shaDateRow}>
											<View style={[styles.shaBadge, { backgroundColor: colors.actionOpacity10 }]}>
												<StyledText
													variant="medium"
													style={[styles.shaText, { color: colors.textSecondary }]}
												>
													{ghCommit.sha.substring(0, 7)}
												</StyledText>
											</View>
											<StyledText
												variant="light"
												style={[styles.commitDate, { color: colors.textSecondary }]}
											>
												{new Date(
													ghCommit.date
												).toLocaleString('en-US', {
													month: 'short',
													day: 'numeric',
													hour: '2-digit',
													minute: '2-digit',
												})}
											</StyledText>
										</View>

										{/* View on GitHub Button */}
										<TouchableOpacity
											onPress={() =>
												openGitHubUrl(ghCommit.url)
											}
											style={[styles.viewButton, { backgroundColor: colors.actionOpacity10 }]}
										>
											<Ionicons
												name="open-outline"
												size={12}
												color={colors.action}
											/>
											<StyledText
												variant="medium"
												style={[styles.viewButtonText, { color: colors.action }]}
											>
												View
											</StyledText>
										</TouchableOpacity>
									</View>
								</View>
							))}
						</View>
					)}
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		borderRadius: 16,
		padding: 16,
		marginBottom: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 4,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		marginBottom: 8,
	},
	headerContent: {
		flex: 1,
	},
	titleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	dateText: {
		fontSize: 18,
	},
	githubSyncBadge: {
		backgroundColor: 'rgba(124, 58, 237, 0.1)',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 6,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	manualBadge: {
		backgroundColor: 'rgba(14, 165, 164, 0.1)',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 6,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	timeText: {
		fontSize: 14,
	},
	manualSection: {
		marginBottom: 2,
		padding: 4,
		borderRadius: 12,
	},
	manualTitle: {
		fontSize: 20,
		marginBottom: 8,
	},
	metaRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		marginBottom: 12,
	},
	timeSpentBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		backgroundColor: 'rgba(124, 58, 237, 0.1)',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 999,
	},
	timeSpentText: {
		color: '#7C3AED',
		fontSize: 14,
	},
	difficultyBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		backgroundColor: 'rgba(124, 58, 237, 0.1)',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 999,
	},
	difficultyEmoji: {
		fontSize: 16,
	},
	difficultyText: {
		fontSize: 14,
		textTransform: 'capitalize',
	},
	description: {
		fontSize: 16,
		marginBottom: 12,
		lineHeight: 24,
		opacity: 0.8,
	},
	githubSection: {
		marginBottom: 12,
	},
	expandButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: 12,
		borderRadius: 12,
		marginBottom: 8,
	},
	expandButtonContent: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	expandedContent: {
		gap: 8,
	},
	githubCommit: {
		padding: 12,
		borderRadius: 8,
		borderLeftWidth: 4,
	},
	repoRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginBottom: 8,
	},
	repoText: {
		fontSize: 14,
	},
	commitMessage: {
		fontSize: 14,
		marginBottom: 8,
	},
	commitFooter: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	shaDateRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	shaBadge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
	},
	shaText: {
		fontSize: 12,
	},
	commitDate: {
		fontSize: 12,
	},
	viewButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
	},
	viewButtonText: {
		fontSize: 12,
	},
});

import StyledText from '@/components/ui/StyledText';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { DailyCommit } from '@/types/Commit.types';
import { Ionicons } from '@expo/vector-icons';
import {
	addMonths,
	eachDayOfInterval,
	endOfMonth,
	endOfWeek,
	format,
	isFuture,
	isToday,
	parseISO,
	startOfMonth,
	startOfWeek,
	subMonths,
} from 'date-fns';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface CommitCalendarProps {
	commits: DailyCommit[];
}

export default function CommitCalendar({ commits }: CommitCalendarProps) {
	const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
	const [modalVisible, setModalVisible] = useState<boolean>(false);
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);

	const { colors, isDark } = useThemedStyles();

	const commitMap = useMemo(() => {
		const map = new Map<string, DailyCommit[]>();
		commits.forEach((commit) => {
			const dateKey = format(parseISO(commit.date), 'yyyy-MM-dd');
			if (!map.has(dateKey)) {
				map.set(dateKey, []);
			}
			map.get(dateKey)?.push(commit);
		});
		return map;
	}, [commits]);

	const calendarDays = useMemo(() => {
		const monthStart = startOfMonth(currentMonth);
		const monthEnd = endOfMonth(currentMonth);
		const startDate = startOfWeek(monthStart);
		const endDate = endOfWeek(monthEnd);

		return eachDayOfInterval({ start: startDate, end: endDate });
	}, [currentMonth]);

	// Get commit intensity (0-4) for coloring
	const getCommitIntensity = (date: Date): number => {
		const dateKey = format(date, 'yyyy-MM-dd');
		const dayCommits = commitMap.get(dateKey);

		if (!dayCommits || dayCommits.length === 0) return 0;
		if (dayCommits.length === 1) return 1;
		if (dayCommits.length === 2) return 2;
		if (dayCommits.length === 3) return 3;
		return 4; // 4+ commits
	};

	// Get color based on intensity
	const getColor = (intensity: number, date: Date): string => {
		if (isFuture(date)) {
			return isDark ? '#1F2937' : '#F3F4F6';
		}

		if (isDark) {
			switch (intensity) {
				case 0: return '#374151';
				case 1: return '#064E3B';
				case 2: return '#047857';
				case 3: return '#10B981';
				case 4: return '#34D399';
				default: return '#374151';
			}
		} else {
			switch (intensity) {
				case 0: return '#E5E7EB';
				case 1: return '#BBF7D0';
				case 2: return '#86EFAC';
				case 3: return '#4ADE80';
				case 4: return '#22C55E';
				default: return '#E5E7EB';
			}
		}
	};

	const handlePreviousMonth = () => {
		setCurrentMonth((prev) => subMonths(prev, 1));
	};

	const handleNextMonth = () => {
		setCurrentMonth((prev) => addMonths(prev, 1));
	};

	const handleDayPress = (day: Date, dayCommits: DailyCommit[] | undefined) => {
		if (dayCommits && dayCommits.length > 0) {
			setSelectedDate(day);
			setModalVisible(true);
		}
	};

	const handleCloseModal = () => {
		setModalVisible(false);
		setSelectedDate(null);
	};

	const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

	// Calculate stats for current month
	const monthStats = useMemo(() => {
		const monthStart = startOfMonth(currentMonth);
		const monthEnd = endOfMonth(currentMonth);
		let daysWithCommits = 0;
		let totalCommits = 0;

		calendarDays.forEach((day) => {
			if (day >= monthStart && day <= monthEnd && !isFuture(day)) {
				const dateKey = format(day, 'yyyy-MM-dd');
				const dayCommits = commitMap.get(dateKey);
				if (dayCommits && dayCommits.length > 0) {
					daysWithCommits++;
					totalCommits += dayCommits.length;
				}
			}
		});

		return { daysWithCommits, totalCommits };
	}, [currentMonth, calendarDays, commitMap]);

	return (
		<View style={styles.container}>
			{/* Calendar View */}

			<View style={[styles.card, { backgroundColor: colors.surface }]}>
				{/* Month Navigation */}
				<View style={styles.headerRow}>
					<TouchableOpacity
						onPress={handlePreviousMonth}
						style={styles.navButton}
					>
						<Ionicons
							name="chevron-back"
							size={24}
							color="#7C3AED"
						/>
					</TouchableOpacity>

					<View style={styles.headerCenter}>
						<StyledText
							variant="extrabold"
							style={[styles.monthText, { color: colors.text }]}
						>
							{format(currentMonth, 'MMMM yyyy')}
						</StyledText>
						<StyledText
							variant="light"
							style={[styles.statsText, { color: colors.textMuted }]}
						>
							{monthStats.totalCommits} commits
						</StyledText>
					</View>

					<TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
						<Ionicons
							name="chevron-forward"
							size={24}
							color="#7C3AED"
						/>
					</TouchableOpacity>
				</View>

				{/* Week Day Headers */}
				<View style={styles.weekDaysRow}>
					{weekDays.map((day, index) => (
						<View key={index} style={styles.weekDayCell}>
							<StyledText
								variant="semibold"
								style={[styles.weekDayText, { color: colors.textMuted }]}
							>
								{day}
							</StyledText>
						</View>
					))}
				</View>

				{/* Calendar Grid */}
				<ScrollView showsVerticalScrollIndicator={false}>
					<View style={styles.calendarGrid}>
						{calendarDays.map((day, index) => {
							const intensity = getCommitIntensity(day);
							const color = getColor(intensity, day);
							const isCurrentMonth =
								format(day, 'MM') ===
								format(currentMonth, 'MM');
							const isTodayDate = isToday(day);
							const dateKey = format(day, 'yyyy-MM-dd');
							const dayCommits = commitMap.get(dateKey);

							return (
								<TouchableOpacity
									key={index}
									style={styles.dayCell}
									onPress={() => handleDayPress(day, dayCommits)}
									disabled={!dayCommits || dayCommits.length === 0}
								>
									<View
										style={[
											styles.dayBox,
											{ backgroundColor: color },
											isTodayDate && styles.todayBorder,
											!isCurrentMonth && styles.notCurrentMonth
										]}
									>
										<StyledText
											variant={
												isTodayDate
													? 'extrabold'
													: 'medium'
											}
											style={[
												styles.dayNumber,
												{
													color: intensity >= 3 ? '#fff' : colors.text
												}
											]}
										>
											{format(day, 'd')}
										</StyledText>
									</View>
									{dayCommits && dayCommits.length > 0 && (
										<View style={styles.commitCount}>
											<StyledText style={styles.commitCountText}>
												{dayCommits.length}
											</StyledText>
										</View>
									)}
								</TouchableOpacity>
							);
						})}
					</View>
				</ScrollView>

				{/* Legend */}
				<View style={[styles.legend, { borderTopColor: colors.border }]}>
					<StyledText
						variant="semibold"
						style={[styles.legendTitle, { color: colors.text }]}
					>
						Activity Level
					</StyledText>
					<View style={styles.legendRow}>
						<StyledText
							variant="light"
							style={[styles.legendLabel, { color: colors.textMuted }]}
						>
							Less
						</StyledText>
						<View style={styles.legendColors}>
							<View style={[styles.legendBox, { backgroundColor: getColor(0, new Date()) }]} />
							<View style={[styles.legendBox, { backgroundColor: getColor(1, new Date()) }]} />
							<View style={[styles.legendBox, { backgroundColor: getColor(2, new Date()) }]} />
							<View style={[styles.legendBox, { backgroundColor: getColor(3, new Date()) }]} />
							<View style={[styles.legendBox, { backgroundColor: getColor(4, new Date()) }]} />
						</View>
						<StyledText
							variant="light"
							style={[styles.legendLabel, { color: colors.textMuted }]}
						>
							More
						</StyledText>
					</View>
					<View style={styles.legendCountRow}>
						<StyledText
							variant="light"
							style={[styles.legendCount, { color: colors.textMuted }]}
						>
							0 • 1 • 2 • 3 • 4+ commits per day
						</StyledText>
					</View>
				</View>
			</View>

			{/* Commits Modal */}
			<Modal
				visible={modalVisible}
				transparent
				animationType="slide"
				onRequestClose={handleCloseModal}
			>
				<Pressable 
					style={styles.modalOverlay}
					onPress={handleCloseModal}
				>
					<Pressable 
						style={[styles.modalContent, { backgroundColor: colors.surface }]}
						onPress={(e) => e.stopPropagation()}
					>
						{/* Modal Header */}
						<View style={styles.modalHeader}>
							<View style={styles.modalHandle} />
							<View style={styles.modalTitleRow}>
								<View>
									<StyledText variant="extrabold" style={[styles.modalTitle, { color: colors.text }]}>
										{selectedDate && format(selectedDate, 'MMMM d, yyyy')}
									</StyledText>
									<StyledText variant="light" style={[styles.modalSubtitle, { color: colors.textMuted }]}>
										{selectedDate && commitMap.get(format(selectedDate, 'yyyy-MM-dd'))?.length || 0} {
											commitMap.get(format(selectedDate || new Date(), 'yyyy-MM-dd'))?.length === 1 ? 'commit' : 'commits'
										}
									</StyledText>
								</View>
								<TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
									<Ionicons name="close" size={28} color={colors.text} />
								</TouchableOpacity>
							</View>
						</View>

						{/* Commits List */}
						<ScrollView 
							style={styles.modalScroll}
							showsVerticalScrollIndicator={false}
						>
							{selectedDate && commitMap.get(format(selectedDate, 'yyyy-MM-dd'))?.map((commit, index) => (
								<View 
									key={commit.id} 
									style={[
										styles.commitItem,
										{ 
											backgroundColor: colors.neutral,
											borderLeftColor: '#7C3AED'
										}
									]}
								>
									<View style={styles.commitHeader}>
										<View style={styles.commitBadge}>
											<Ionicons name="git-commit" size={16} color="#7C3AED" />
										</View>
										<StyledText variant="semibold" style={[styles.commitTitle, { color: colors.text }]}>
											{commit.title || 'Commit'}
										</StyledText>
									</View>

									{commit.note && (
										<StyledText variant="medium" style={[styles.commitNote, { color: colors.textSecondary }]}>
											{commit.note}
										</StyledText>
									)}

									{commit.description && (
										<StyledText variant="light" style={[styles.commitDescription, { color: colors.textMuted }]}>
											{commit.description}
										</StyledText>
									)}

									{/* Additional Details */}
									<View style={styles.commitDetails}>
										{commit.timeSpent && commit.timeUnit && (
											<View style={[styles.detailChip, { backgroundColor: colors.surface }]}>
												<Ionicons name="time-outline" size={14} color="#7C3AED" />
												<StyledText variant="medium" style={[styles.detailText, { color: colors.text }]}>
													{commit.timeSpent} {commit.timeUnit}
												</StyledText>
											</View>
										)}
										{commit.difficulty && (
											<View style={[styles.detailChip, { backgroundColor: colors.surface }]}>
												<StyledText variant="medium" style={[styles.detailText, { color: colors.text }]}>
													{commit.difficulty === 'easy' ? '😊' : commit.difficulty === 'medium' ? '😐' : '😰'} {commit.difficulty}
												</StyledText>
											</View>
										)}
									</View>

									{/* GitHub Commits */}
									{commit.githubCommits && commit.githubCommits.length > 0 && (
										<View style={styles.githubSection}>
											<View style={styles.githubHeader}>
												<Ionicons name="logo-github" size={16} color={colors.textMuted} />
												<StyledText variant="semibold" style={[styles.githubTitle, { color: colors.textMuted }]}>
													GitHub Commits ({commit.githubCommits.length})
												</StyledText>
											</View>
											{commit.githubCommits.map((gh, ghIndex) => (
												<View key={ghIndex} style={styles.githubCommit}>
													<View style={styles.githubCommitDot} />
													<View style={styles.githubCommitContent}>
														<StyledText variant="medium" style={[styles.githubMessage, { color: colors.text }]}>
															{gh.message.split('\n')[0]}
														</StyledText>
														<StyledText variant="light" style={[styles.githubRepo, { color: colors.textMuted }]}>
															{gh.repo}
														</StyledText>
													</View>
												</View>
											))}
										</View>
									)}

									{index < (commitMap.get(format(selectedDate, 'yyyy-MM-dd'))?.length || 0) - 1 && (
										<View style={[styles.commitDivider, { backgroundColor: colors.border }]} />
									)}
								</View>
							))}
						</ScrollView>
					</Pressable>
				</Pressable>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: 16,
	},
	card: {
		borderRadius: 16,
		padding: 16,
		marginTop: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
	},
	headerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 16,
	},
	navButton: {
		padding: 8,
	},
	headerCenter: {
		alignItems: 'center',
	},
	monthText: {
		fontSize: 20,
	},
	statsText: {
		fontSize: 14,
		marginTop: 4,
		opacity: 0.6,
	},
	weekDaysRow: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		marginBottom: 8,
	},
	weekDayCell: {
		width: 40,
		alignItems: 'center',
	},
	weekDayText: {
		fontSize: 12,
		opacity: 0.4,
	},
	calendarGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
	dayCell: {
		width: '14.28%',
		alignItems: 'center',
		marginBottom: 8,
	},
	dayBox: {
		width: 36,
		height: 36,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	todayBorder: {
		borderWidth: 2,
		borderColor: '#7C3AED',
	},
	notCurrentMonth: {
		opacity: 0.3,
	},
	dayNumber: {
		fontSize: 12,
	},
	commitCount: {
		marginTop: 4,
	},
	commitCountText: {
		fontSize: 8,
		color: '#7C3AED',
	},
	legend: {
		marginTop: 16,
		paddingTop: 16,
		borderTopWidth: 1,
	},
	legendTitle: {
		fontSize: 14,
		marginBottom: 8,
	},
	legendRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	legendLabel: {
		fontSize: 12,
	},
	legendColors: {
		flexDirection: 'row',
		gap: 4,
	},
	legendBox: {
		width: 24,
		height: 24,
		borderRadius: 4,
	},
	legendCountRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 8,
	},
	legendCount: {
		fontSize: 12,
		textAlign: 'center',
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'flex-end',
	},
	modalContent: {
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		maxHeight: '70%',
		paddingBottom: 24,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: -4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 16,
	},
	modalHeader: {
		paddingHorizontal: 24,
		paddingTop: 12,
		paddingBottom: 16,
	},
	modalHandle: {
		width: 40,
		height: 4,
		backgroundColor: '#CBD5E1',
		borderRadius: 2,
		alignSelf: 'center',
		marginBottom: 16,
	},
	modalTitleRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
	},
	modalTitle: {
		fontSize: 24,
		marginBottom: 4,
	},
	modalSubtitle: {
		fontSize: 14,
	},
	closeButton: {
		padding: 4,
	},
	modalScroll: {
		paddingHorizontal: 24,
	},
	commitItem: {
		borderRadius: 16,
		padding: 16,
		marginBottom: 16,
		borderLeftWidth: 4,
	},
	commitHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
		gap: 8,
	},
	commitBadge: {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: 'rgba(124, 58, 237, 0.1)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	commitTitle: {
		fontSize: 18,
		flex: 1,
	},
	commitNote: {
		fontSize: 15,
		marginBottom: 8,
		lineHeight: 20,
	},
	commitDescription: {
		fontSize: 14,
		marginBottom: 12,
		lineHeight: 20,
	},
	commitDetails: {
		flexDirection: 'row',
		gap: 8,
		flexWrap: 'wrap',
		marginBottom: 8,
	},
	detailChip: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 12,
		gap: 4,
	},
	detailText: {
		fontSize: 13,
		textTransform: 'capitalize',
	},
	githubSection: {
		marginTop: 12,
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: '#E5E7EB',
	},
	githubHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		marginBottom: 8,
	},
	githubTitle: {
		fontSize: 13,
	},
	githubCommit: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		marginBottom: 8,
		gap: 8,
	},
	githubCommitDot: {
		width: 6,
		height: 6,
		borderRadius: 3,
		backgroundColor: '#7C3AED',
		marginTop: 6,
	},
	githubCommitContent: {
		flex: 1,
	},
	githubMessage: {
		fontSize: 13,
		marginBottom: 2,
	},
	githubRepo: {
		fontSize: 11,
	},
	commitDivider: {
		height: 1,
		marginTop: 16,
	},
});

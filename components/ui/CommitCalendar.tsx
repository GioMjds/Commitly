import StyledText from '@/components/ui/StyledText';
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
import { ScrollView, TouchableOpacity, View } from 'react-native';

interface CommitCalendarProps {
	commits: DailyCommit[];
}

export default function CommitCalendar({ commits }: CommitCalendarProps) {
	const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

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
	const getColorClass = (intensity: number, date: Date): string => {
		if (isFuture(date)) return 'bg-gray-100';

		switch (intensity) {
			case 0:
				return 'bg-gray-200';
			case 1:
				return 'bg-green-200';
			case 2:
				return 'bg-green-400';
			case 3:
				return 'bg-green-600';
			case 4:
				return 'bg-green-800';
			default:
				return 'bg-gray-200';
		}
	};

	const handlePreviousMonth = () => {
		setCurrentMonth((prev) => subMonths(prev, 1));
	};

	const handleNextMonth = () => {
		setCurrentMonth((prev) => addMonths(prev, 1));
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
		<View className="mb-4">
			{/* Calendar View */}

			<View className="bg-white rounded-2xl p-4 mt-2 shadow-sm">
				{/* Month Navigation */}
				<View className="flex-row items-center justify-between mb-4">
					<TouchableOpacity
						onPress={handlePreviousMonth}
						className="p-2"
					>
						<Ionicons
							name="chevron-back"
							size={24}
							color="#7C3AED"
						/>
					</TouchableOpacity>

					<View className="items-center">
						<StyledText
							variant="extrabold"
							className="text-primary text-xl"
						>
							{format(currentMonth, 'MMMM yyyy')}
						</StyledText>
						<StyledText
							variant="light"
							className="text-primary/60 text-sm mt-1"
						>
							{monthStats.totalCommits} commits
						</StyledText>
					</View>

					<TouchableOpacity onPress={handleNextMonth} className="p-2">
						<Ionicons
							name="chevron-forward"
							size={24}
							color="#7C3AED"
						/>
					</TouchableOpacity>
				</View>

				{/* Week Day Headers */}
				<View className="flex-row justify-around mb-2">
					{weekDays.map((day, index) => (
						<View key={index} className="w-10 items-center">
							<StyledText
								variant="semibold"
								className="text-primary/40 text-xs"
							>
								{day}
							</StyledText>
						</View>
					))}
				</View>

				{/* Calendar Grid */}
				<ScrollView showsVerticalScrollIndicator={false}>
					<View className="flex-row flex-wrap">
						{calendarDays.map((day, index) => {
							const intensity = getCommitIntensity(day);
							const colorClass = getColorClass(intensity, day);
							const isCurrentMonth =
								format(day, 'MM') ===
								format(currentMonth, 'MM');
							const isTodayDate = isToday(day);
							const dateKey = format(day, 'yyyy-MM-dd');
							const dayCommits = commitMap.get(dateKey);

							return (
								<View
									key={index}
									className="w-[14.28%] items-center mb-2"
								>
									<View
										className={`w-9 h-9 rounded-lg items-center justify-center ${colorClass} ${
											isTodayDate
												? 'border-2 border-action'
												: ''
										} ${
											!isCurrentMonth ? 'opacity-30' : ''
										}`}
									>
										<StyledText
											variant={
												isTodayDate
													? 'extrabold'
													: 'medium'
											}
											className={`text-xs ${
												intensity >= 3
													? 'text-white'
													: 'text-primary'
											}`}
										>
											{format(day, 'd')}
										</StyledText>
									</View>
									{dayCommits && dayCommits.length > 0 && (
										<View className="mt-1">
											<StyledText className="text-[8px] text-action">
												{dayCommits.length}
											</StyledText>
										</View>
									)}
								</View>
							);
						})}
					</View>
				</ScrollView>

				{/* Legend */}
				<View className="mt-4 pt-4 border-t border-gray-200">
					<StyledText
						variant="semibold"
						className="text-primary text-sm mb-2"
					>
						Activity Level
					</StyledText>
					<View className="flex-row items-center justify-between">
						<StyledText
							variant="light"
							className="text-primary/60 text-xs"
						>
							Less
						</StyledText>
						<View className="flex-row gap-1">
							<View className="w-6 h-6 rounded bg-gray-200" />
							<View className="w-6 h-6 rounded bg-green-200" />
							<View className="w-6 h-6 rounded bg-green-400" />
							<View className="w-6 h-6 rounded bg-green-600" />
							<View className="w-6 h-6 rounded bg-green-800" />
						</View>
						<StyledText
							variant="light"
							className="text-primary/60 text-xs"
						>
							More
						</StyledText>
					</View>
					<View className="flex-row justify-center mt-2">
						<StyledText
							variant="light"
							className="text-primary/60 text-xs text-center"
						>
							0 • 1 • 2 • 3 • 4+ commits per day
						</StyledText>
					</View>
				</View>
			</View>
		</View>
	);
}

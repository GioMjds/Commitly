import StyledText from '@/components/ui/StyledText';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { DateRange } from '@/types/History.types';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface FilterBarProps {
	selectedDateRange: DateRange;
	onDateRangeChange: (range: DateRange) => void;
}

export default function FilterBar({
	selectedDateRange,
	onDateRangeChange,
}: FilterBarProps) {
	const { colors } = useThemedStyles();

	return (
		<View style={styles.container}>
			<View style={[styles.card, { backgroundColor: colors.surface }]}>
				{/* Date Range Filter */}
				<View style={styles.section}>
					<StyledText
						variant="semibold"
						style={[styles.sectionTitle, { color: colors.text }]}
					>
						Date Range
					</StyledText>
					<View style={styles.optionsRow}>
						{(['all', 'week', 'month', 'year'] as DateRange[]).map(
							(range) => (
								<TouchableOpacity
									key={range}
									onPress={() => onDateRangeChange(range)}
									style={[
										styles.option,
										selectedDateRange === range
											? styles.optionActive
											: [styles.optionInactive, { backgroundColor: colors.neutral }]
									]}
								>
									<StyledText
										variant="medium"
										style={
											selectedDateRange === range
												? styles.optionTextActive
												: [styles.optionTextInactive, { color: colors.text }]
										}
									>
										{range.charAt(0).toUpperCase() +
											range.slice(1)}
									</StyledText>
								</TouchableOpacity>
							)
						)}
					</View>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: 8,
	},
	card: {
		borderRadius: 12,
		padding: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
	},
	section: {
		marginBottom: 4,
	},
	sectionTitle: {
		marginBottom: 8,
	},
	optionsRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	option: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 12,
	},
	optionActive: {
		backgroundColor: '#7C3AED',
	},
	optionInactive: {},
	optionTextActive: {
		color: '#fff',
	},
	optionTextInactive: {},
});

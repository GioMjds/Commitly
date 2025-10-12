import { useThemedStyles } from '@/hooks/useThemedStyles';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import StyledText from '../ui/StyledText';

type IconName =
	| 'home'
	| 'list'
	| 'home-outline'
	| 'list-outline';

interface TabConfig {
	name: string;
	label: string;
	icon: IconName;
	iconOutline: IconName;
}

const TAB_CONFIG: Record<string, TabConfig> = {
	index: {
		name: 'index',
		label: 'Dashboard',
		icon: 'home',
		iconOutline: 'home-outline',
	},
	history: {
		name: 'history',
		label: 'History',
		icon: 'list',
		iconOutline: 'list-outline',
	},
};

export default function CustomTabBar({
	state,
	descriptors,
	navigation,
}: BottomTabBarProps) {
	const { colors } = useThemedStyles();

	const handleAddPress = () => {
		if (Platform.OS === 'ios') {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		}
		router.push('/(add)/add-commit');
	};

	return (
		<View
			style={[
				styles.tabBarContainer,
				{
					backgroundColor: colors.surface,
					borderTopColor: colors.border,
				}
			]}
		>
			<View style={styles.tabBarContent}>
				{state.routes.map((route, index) => {
					const { options } = descriptors[route.key];
					const isFocused = state.index === index;
					const tabConfig = TAB_CONFIG[route.name];

					if (!tabConfig) {
						return null;
					}

					const onPress = () => {
						const event = navigation.emit({
							type: 'tabPress',
							target: route.key,
							canPreventDefault: true,
						});

						if (!isFocused && !event.defaultPrevented) {
							if (Platform.OS === 'ios') {
								Haptics.impactAsync(
									Haptics.ImpactFeedbackStyle.Light
								);
							}
							navigation.navigate(route.name);
						}
					};

					const onLongPress = () => {
						navigation.emit({
							type: 'tabLongPress',
							target: route.key,
						});
					};

					return (
						<React.Fragment key={route.key}>
							<TouchableOpacity
								accessibilityRole="button"
								accessibilityState={
									isFocused ? { selected: true } : {}
								}
								accessibilityLabel={
									options.tabBarAccessibilityLabel
								}
								onPress={onPress}
								onLongPress={onLongPress}
								style={styles.tabButton}
							>
								<View style={styles.tabContent}>
									<Ionicons
										name={
											isFocused
												? tabConfig.icon
												: tabConfig.iconOutline
										}
										size={24}
										color={isFocused ? '#7C3AED' : '#94a3b8'}
									/>
									<StyledText
										variant={isFocused ? 'semibold' : 'medium'}
										style={[
											styles.tabLabel,
											{ color: isFocused ? '#7C3AED' : '#6b7280' }
										]}
									>
										{tabConfig.label}
									</StyledText>
								</View>
							</TouchableOpacity>

							{/* Center Add Button after first tab */}
							{index === 0 && (
								<TouchableOpacity
									onPress={handleAddPress}
									accessibilityRole="button"
									accessibilityLabel="Add new commit"
									style={styles.tabButton}
								>
									<View style={styles.addButton}>
										<Ionicons name="add-circle" size={45} color="#ffffff" />
									</View>
									<StyledText 
										style={[styles.addButtonLabel, { color: colors.text }]} 
										variant='semibold'
									>
										Add Commit
									</StyledText>
								</TouchableOpacity>
							)}
						</React.Fragment>
					);
				})}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	tabBarContainer: {
		borderTopWidth: 1,
		paddingBottom: Platform.OS === 'ios' ? 20 : 10,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 8,
	},
	tabBarContent: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingTop: 8,
	},
	tabButton: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 8,
	},
	tabContent: {
		alignItems: 'center',
		justifyContent: 'center',
		padding: 16,
		borderRadius: 9999,
	},
	tabLabel: {
		fontSize: 16,
		marginTop: 4,
	},
	addButton: {
		backgroundColor: '#7C3AED',
		borderRadius: 9999,
		width: 64,
		height: 64,
		alignItems: 'center',
		justifyContent: 'center',
	},
	addButtonLabel: {
		fontSize: 16,
		marginTop: 4,
	},
});

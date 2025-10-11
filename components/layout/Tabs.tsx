import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
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
	const handleAddPress = () => {
		if (Platform.OS === 'ios') {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		}
		router.push('/(add)/add-commit');
	};

	return (
		<View
			className="bg-white border-t border-gray-200"
			style={{
				paddingBottom: Platform.OS === 'ios' ? 20 : 10,
				shadowColor: '#000',
				shadowOffset: { width: 0, height: -2 },
				shadowOpacity: 0.05,
				shadowRadius: 8,
				elevation: 8,
			}}
		>
			<View className="flex-row justify-around items-center px-4 pt-2">
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
						<>
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
								className="flex-1 items-center justify-center py-2"
							>
								<View
									className={`items-center justify-center p-4 rounded-full`}
								>
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
										className={`text-md mt-1 ${
											isFocused
												? 'text-action'
												: 'text-gray-500'
										}`}
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
									className="flex-1 items-center justify-center py-2"
								>
									<View className="bg-action rounded-full w-16 h-16 items-center justify-center">
										<Ionicons name="add-circle" size={45} color="#ffffff" />
									</View>
									<StyledText className="text-md mt-1" variant='semibold'>
										Add Commit
									</StyledText>
								</TouchableOpacity>
							)}
						</>
					);
				})}
			</View>
		</View>
	);
}

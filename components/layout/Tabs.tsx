import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import StyledText from '../ui/StyledText';

type IconName =
	| 'home'
	| 'add-circle'
	| 'list'
	| 'home-outline'
	| 'add-circle-outline'
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
	'add-commit': {
		name: 'add-commit',
		label: 'Add',
		icon: 'add-circle',
		iconOutline: 'add-circle-outline',
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
							// Haptic feedback on tab press
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

					// Special styling for middle "Add" button
					const isAddButton = route.name === 'add-commit';

					if (isAddButton) {
						return (
							<TouchableOpacity
								key={route.key}
								accessibilityRole="button"
								accessibilityState={
									isFocused ? { selected: true } : {}
								}
								accessibilityLabel={
									options.tabBarAccessibilityLabel
								}
								onPress={onPress}
								onLongPress={onLongPress}
								className="items-center justify-center -mt-6"
							>
								<View
									className={`rounded-full p-4 shadow-lg ${
										isFocused ? 'bg-action' : 'bg-action'
									}`}
									style={{
										shadowColor: '#7C3AED',
										shadowOffset: { width: 0, height: 4 },
										shadowOpacity: 0.3,
										shadowRadius: 8,
										elevation: 8,
									}}
								>
									<Ionicons
										name={tabConfig.icon}
										size={32}
										color="white"
									/>
								</View>
								<StyledText
									variant="semibold"
									className={`text-md mt-2 ${
										isFocused
											? 'text-action'
											: 'text-gray-500'
									}`}
								>
									{tabConfig.label}
								</StyledText>
							</TouchableOpacity>
						);
					}

					return (
						<TouchableOpacity
							key={route.key}
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
					);
				})}
			</View>
		</View>
	);
}

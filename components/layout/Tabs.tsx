import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import StyledText from '../ui/StyledText';

type IconName =
	| 'home'
	| 'list'
	| 'settings'
	| 'home-outline'
	| 'list-outline'
	| 'settings-outline';

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
	settings: {
		name: 'settings',
		label: 'Settings',
		icon: 'settings',
		iconOutline: 'settings-outline',
	}
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

import StyledText from '@/components/ui/StyledText';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Modal, Pressable, TouchableOpacity, View } from 'react-native';

interface AlertButton {
	text: string;
	onPress?: () => void;
	style?: 'default' | 'cancel' | 'destructive';
}

interface AlertProps {
	visible: boolean;
	title: string;
	message?: string;
	icon?: keyof typeof Ionicons.glyphMap;
	iconColor?: string;
	buttons?: AlertButton[];
	onClose: () => void;
}

const Alert = ({
	visible,
	title,
	message,
	icon,
	iconColor = '#7C3AED',
	buttons = [{ text: 'OK', style: 'default' }],
	onClose,
}: AlertProps) => {
	const handleButtonPress = (button: AlertButton) => {
		if (button.onPress) {
			button.onPress();
		}
		onClose();
	};

	const getButtonStyles = (style?: string) => {
		switch (style) {
			case 'cancel':
				return 'bg-gray-200';
			case 'destructive':
				return 'bg-red-500';
			default:
				return 'bg-action';
		}
	};

	const getButtonTextStyles = (style?: string) => {
		switch (style) {
			case 'cancel':
				return 'text-primary';
			case 'destructive':
				return 'text-white';
			default:
				return 'text-white';
		}
	};

	return (
		<Modal
			transparent
			visible={visible}
			onRequestClose={onClose}
			animationType="fade"
			statusBarTranslucent
		>
			{/* Change status bar style when modal is visible */}
			{visible && <StatusBar style="light" backgroundColor="rgba(0,0,0,0.5)" />}
			
			<Pressable
				className="flex-1 bg-black/50 justify-center items-center px-6"
				onPress={onClose}
			>
				<Pressable
					className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
					onPress={(e) => e.stopPropagation()}
				>
					{/* Icon */}
					{icon && (
						<View className="items-center mb-4">
							<View
								className="w-16 h-16 rounded-full items-center justify-center"
								style={{ backgroundColor: `${iconColor}20` }}
							>
								<Ionicons name={icon} size={32} color={iconColor} />
							</View>
						</View>
					)}

					{/* Title */}
					<StyledText
						variant="extrabold"
						className="text-primary text-2xl text-center mb-2"
					>
						{title}
					</StyledText>

					{/* Message */}
					{message && (
						<StyledText
							variant="regular"
							className="text-primary/70 text-base text-center mb-6"
						>
							{message}
						</StyledText>
					)}

					{/* Buttons */}
					<View className="gap-3">
						{buttons.map((button, index) => (
							<TouchableOpacity
								key={index}
								onPress={() => handleButtonPress(button)}
								className={`py-4 rounded-2xl ${getButtonStyles(button.style)}`}
							>
								<StyledText
									variant="semibold"
									className={`text-center text-lg ${getButtonTextStyles(button.style)}`}
								>
									{button.text}
								</StyledText>
							</TouchableOpacity>
						))}
					</View>
				</Pressable>
			</Pressable>
		</Modal>
	);
};

export default Alert;

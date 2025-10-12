import StyledText from '@/components/ui/StyledText';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';

interface AlertButton {
	text: string;
	onPress?: () => void;
	style?: 'default' | 'cancel' | 'destructive';
}

interface AlertProps {
	visible: boolean;
	title?: string;
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
	const { colors } = useThemedStyles();

	const handleButtonPress = (button: AlertButton) => {
		if (button.onPress) {
			button.onPress();
		}
		onClose();
	};

	const getButtonBackgroundColor = (style?: string) => {
		switch (style) {
			case 'cancel':
				return colors.neutral;
			case 'destructive':
				return '#ef4444';
			default:
				return '#7C3AED';
		}
	};

	const getButtonTextColor = (style?: string) => {
		switch (style) {
			case 'cancel':
				return colors.text;
			case 'destructive':
				return '#fff';
			default:
				return '#fff';
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
			{visible && (
				<StatusBar style="light" backgroundColor="rgba(0,0,0,0.5)" />
			)}

			<Pressable
				style={styles.overlay}
				onPress={onClose}
			>
				<Pressable
					style={[styles.alertBox, { backgroundColor: colors.surface }]}
					onPress={(e) => e.stopPropagation()}
				>
					{/* Icon */}
					{icon && (
						<View style={styles.iconContainer}>
							<View
								style={[
									styles.iconCircle,
									{ backgroundColor: `${iconColor}20` }
								]}
							>
								<Ionicons
									name={icon}
									size={32}
									color={iconColor}
								/>
							</View>
						</View>
					)}

					{/* Title */}
					{title && (
						<StyledText
							variant="extrabold"
							style={[styles.title, { color: colors.text }]}
						>
							{title}
						</StyledText>
					)}

					{/* Message */}
					{message && (
						<StyledText
							variant="medium"
							style={[styles.message, { color: colors.text }]}
						>
							{message}
						</StyledText>
					)}

					{/* Buttons */}
					<View style={styles.buttonsContainer}>
						{buttons.map((button, index) => (
							<TouchableOpacity
								key={index}
								onPress={() => handleButtonPress(button)}
								style={[
									styles.button,
									{ backgroundColor: getButtonBackgroundColor(button.style) }
								]}
							>
								<StyledText
									variant="semibold"
									style={[
										styles.buttonText,
										{ color: getButtonTextColor(button.style) }
									]}
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

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 24,
	},
	alertBox: {
		borderRadius: 24,
		padding: 24,
		width: '100%',
		maxWidth: 384,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.3,
		shadowRadius: 16,
		elevation: 16,
	},
	iconContainer: {
		alignItems: 'center',
		marginBottom: 16,
	},
	iconCircle: {
		width: 64,
		height: 64,
		borderRadius: 32,
		alignItems: 'center',
		justifyContent: 'center',
	},
	title: {
		fontSize: 30,
		textAlign: 'center',
		marginBottom: 8,
	},
	message: {
		fontSize: 18,
		textAlign: 'center',
		marginBottom: 24,
	},
	buttonsContainer: {
		gap: 12,
	},
	button: {
		paddingVertical: 16,
		borderRadius: 16,
	},
	buttonText: {
		textAlign: 'center',
		fontSize: 18,
	},
});

export default Alert;

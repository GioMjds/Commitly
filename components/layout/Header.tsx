import Alert from '@/components/ui/Alert';
import StyledText from '@/components/ui/StyledText';
import { database } from '@/configs/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useAuthStore } from '@/store/AuthStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ref as dbRef, onValue } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';

interface HeaderProps {
	title: string;
	subtitle?: string;
	showProfile?: boolean;
}

const Header = ({ title, subtitle, showProfile = true }: HeaderProps) => {
	const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false);
	const [isLogoutAlertVisible, setIsLogoutAlertVisible] = useState<boolean>(false);
	const [errorAlertVisible, setErrorAlertVisible] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [githubInfo, setGithubInfo] = useState<{ username?: string; avatarUrl?: string; name?: string } | null>(null);

	const { user } = useAuthStore();
	const { logout } = useAuth();
	const { colors } = useThemedStyles();

	const handleLogout = () => {
		setIsDropdownVisible(false);
		setIsLogoutAlertVisible(true);
	};

	useEffect(() => {
		if (!user) return;
		const githubRef = dbRef(database, `users/${user.uid}/github`);
		const unsubscribe = onValue(githubRef, (snapshot) => {
			const val = snapshot.val();
			if (val) {
				setGithubInfo({
					username: val.username,
					avatarUrl: val.avatarUrl || val.photoURL || undefined,
					name: val.name || undefined,
				});
			} else {
				setGithubInfo(null);
			}
		});

		return () => unsubscribe();
	}, [user]);

	const confirmLogout = async () => {
		const result = await logout();
		if (result.success) {
			router.replace('/(auth)/login');
		} else {
			setErrorMessage(result.message);
			setErrorAlertVisible(true);
		}
	};

	return (
		<View style={styles.container}>
			<View style={styles.headerRow}>
				<View style={styles.titleContainer}>
					<StyledText variant="black" style={[styles.title, { color: colors.text }]}>
						{title}
					</StyledText>
					{subtitle && (
						<StyledText variant="light" style={[styles.subtitle, { color: colors.text }]}>
							{subtitle}
						</StyledText>
					)}
				</View>
				
				{showProfile && user && (
					<View>
						{/* Profile Image (prefer GitHub avatar if available) */}
						<TouchableOpacity 
							style={styles.profileButton}
							onPress={() => setIsDropdownVisible(!isDropdownVisible)}
						>
							{githubInfo?.avatarUrl || user.photoURL ? (
								<Image
									source={{ uri: githubInfo?.avatarUrl || user.photoURL! }}
									style={styles.profileImage}
									resizeMode="cover"
								/>
							) : (
								<View style={styles.profilePlaceholder}>
									<StyledText variant="semibold" style={styles.profilePlaceholderText}>
										{user.email?.charAt(0).toUpperCase() || 'U'}
									</StyledText>
								</View>
							)}
						</TouchableOpacity>

						{/* Dropdown Menu */}
						{isDropdownVisible && (
							<>
								{/* Backdrop to close dropdown */}
								<Modal
									transparent
									visible={isDropdownVisible}
									onRequestClose={() => setIsDropdownVisible(false)}
									animationType="fade"
								>
									<Pressable 
										style={styles.modalBackdrop}
										onPress={() => setIsDropdownVisible(false)}
									>
										<View style={[styles.dropdownMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
											{/* User Info */}
											<View style={[styles.userInfo, { borderBottomColor: colors.border }]}>
												{/* Prefer GitHub name + username when available */}
												{(githubInfo?.name || user.displayName) && (
													<StyledText variant="medium" style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
														{githubInfo?.name || user.displayName}
													</StyledText>
												)}
												<StyledText variant="medium" style={[styles.userEmail, { color: colors.text }]} numberOfLines={1}>
													{user.email}
												</StyledText>
											</View>

											{/* Settings Button */}
											<TouchableOpacity
												onPress={() => {
													setIsDropdownVisible(false);
													router.push('/(screens)/settings');
												}}
												style={styles.menuItem}
											>
												<Ionicons name="settings-outline" size={20} color="#4b5563" />
												<StyledText variant="medium" style={[styles.menuItemText, { color: colors.text }]}>
													Settings
												</StyledText>
											</TouchableOpacity>

											{/* Logout Button */}
											<TouchableOpacity
												onPress={handleLogout}
												style={styles.menuItem}
											>
												<Ionicons name="log-out-outline" size={20} color="#ef4444" />
												<StyledText variant="medium" style={styles.logoutText}>
													Logout
												</StyledText>
											</TouchableOpacity>
										</View>
									</Pressable>
								</Modal>
							</>
						)}
					</View>
				)}
			</View>

			{/* Custom Logout Alert */}
			<Alert
				visible={isLogoutAlertVisible}
				title="Log Out"
				message="This will log you out of the app. Are you sure?"
				icon="log-out-outline"
				iconColor="#ef4444"
				buttons={[
					{
						text: 'Cancel',
						style: 'cancel',
						onPress: () => setIsLogoutAlertVisible(false),
					},
					{
						text: 'Log Out',
						style: 'destructive',
						onPress: confirmLogout,
					},
				]}
				onClose={() => setIsLogoutAlertVisible(false)}
			/>

			{/* Error Alert */}
			<Alert
				visible={errorAlertVisible}
				title="Error"
				message={errorMessage}
				icon="alert-circle-outline"
				iconColor="#ef4444"
				buttons={[
					{
						text: 'OK',
						style: 'default',
					},
				]}
				onClose={() => setErrorAlertVisible(false)}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginVertical: 12,
	},
	headerRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	titleContainer: {
		flex: 1,
	},
	title: {
		fontSize: 36,
	},
	subtitle: {
		fontSize: 20,
	},
	profileButton: {
		width: 64,
		height: 64,
		borderRadius: 32,
		overflow: 'hidden',
		borderWidth: 2,
		borderColor: '#7C3AED',
	},
	profileImage: {
		width: '100%',
		height: '100%',
	},
	profilePlaceholder: {
		width: '100%',
		height: '100%',
		backgroundColor: '#7C3AED',
		alignItems: 'center',
		justifyContent: 'center',
	},
	profilePlaceholderText: {
		color: '#fff',
		fontSize: 18,
	},
	modalBackdrop: {
		flex: 1,
	},
	dropdownMenu: {
		position: 'absolute',
		right: 16,
		top: 80,
		borderRadius: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.3,
		shadowRadius: 16,
		elevation: 16,
		borderWidth: 1,
		minWidth: 180,
		overflow: 'hidden',
	},
	userInfo: {
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
	},
	userName: {
		fontSize: 20,
	},
	userEmail: {
		fontSize: 14,
	},
	menuItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	menuItemText: {
		marginLeft: 12,
	},
	logoutText: {
		color: '#ef4444',
		marginLeft: 12,
	},
});

export default Header;

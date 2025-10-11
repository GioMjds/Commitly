import Alert from '@/components/ui/Alert';
import StyledText from '@/components/ui/StyledText';
import { database } from '@/configs/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/AuthStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ref as dbRef, onValue } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { Image, Modal, Pressable, TouchableOpacity, View } from 'react-native';

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
		<View className="mb-6">
			<View className="flex-row justify-between items-center mb-2">
				<View className="flex-1">
					<StyledText variant="black" className="text-primary text-4xl">
						{title}
					</StyledText>
					{subtitle && (
						<StyledText variant="light" className="text-primary text-xl">
							{subtitle}
						</StyledText>
					)}
				</View>
				
				{showProfile && user && (
					<View>
						{/* Profile Image (prefer GitHub avatar if available) */}
						<TouchableOpacity 
							className="w-16 h-16 rounded-full overflow-hidden border-2 border-action"
							onPress={() => setIsDropdownVisible(!isDropdownVisible)}
						>
							{githubInfo?.avatarUrl || user.photoURL ? (
								<Image
									source={{ uri: githubInfo?.avatarUrl || user.photoURL! }}
									className="w-full h-full"
									resizeMode="cover"
								/>
							) : (
								<View className="w-full h-full bg-action items-center justify-center">
									<StyledText variant="semibold" className="text-white text-lg">
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
										className="flex-1"
										onPress={() => setIsDropdownVisible(false)}
									>
										<View className="absolute right-4 top-24 bg-white rounded-2xl shadow-2xl border border-gray-200 min-w-[180px] overflow-hidden">
											{/* User Info */}
											<View className="px-4 py-3 border-b border-gray-200 bg-gray-100">
												{/* Prefer GitHub name + username when available */}
												{(githubInfo?.name || user.displayName) && (
													<StyledText variant="medium" className="text-primary text-xl" numberOfLines={1}>
														{githubInfo?.name || user.displayName}
													</StyledText>
												)}
												<StyledText variant="medium" className="text-primary text-sm" numberOfLines={1}>
													{user.email}
												</StyledText>
											</View>

											{/* Settings Button */}
											<TouchableOpacity
												onPress={() => router.push("/(screens)/settings")}
												className="flex-row items-center px-4 py-3 active:bg-gray-100"
											>
												<Ionicons name="settings-outline" size={20} color="#4b5563" />
												<StyledText variant="medium" className="text-primary ml-3">
													Settings
												</StyledText>
											</TouchableOpacity>

											{/* Logout Button */}
											<TouchableOpacity
												onPress={handleLogout}
												className="flex-row items-center px-4 py-3 active:bg-gray-100"
											>
												<Ionicons name="log-out-outline" size={20} color="#ef4444" />
												<StyledText variant="medium" className="text-red-500 ml-3">
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
				title="Logout"
				message="Are you sure you want to logout?"
				icon="log-out-outline"
				iconColor="#ef4444"
				buttons={[
					{
						text: 'Cancel',
						style: 'cancel',
						onPress: () => setIsLogoutAlertVisible(false),
					},
					{
						text: 'Logout',
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

export default Header;

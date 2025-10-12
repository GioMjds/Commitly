import Header from '@/components/layout/Header';
import Alert from '@/components/ui/Alert';
import StyledText from '@/components/ui/StyledText';
import { useGithubAuth } from '@/hooks/useGithubAuth';
import { useGithubCommits } from '@/hooks/useGithubCommits';
import { useTheme } from '@/hooks/useTheme';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useAuthStore } from '@/store/AuthStore';
import { useThemeStore } from '@/store/ThemeStore';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	ScrollView,
	StyleSheet,
	Switch,
	TouchableOpacity,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
	const [alertVisible, setAlertVisible] = useState<boolean>(false);
	const [alertConfig, setAlertConfig] = useState({
		title: '',
		message: '',
		icon: 'checkmark-circle-outline' as keyof typeof Ionicons.glyphMap,
	});

	const { user } = useAuthStore();
	const { syncSettings, updateSyncSettings, loading } = useGithubCommits();
	const { linkGithubAccount } = useGithubAuth();
	const { themeMode, setThemeMode } = useThemeStore();
	const { activeTheme, isDark } = useTheme();
	const { colors } = useThemedStyles();

	useEffect(() => {
		console.log(`[Settings] 📊 Component mounted/updated`);
		console.log(`[Settings] 📱 Current themeMode: ${themeMode}`);
		console.log(`[Settings] 🎨 Current activeTheme: ${activeTheme}`);
		console.log(`[Settings] 🌙 isDark: ${isDark}`);
	}, [themeMode, activeTheme, isDark]);

	const isGitHubUser = user?.providerData?.some(
		(provider) => provider.providerId === 'github.com'
	);

	const isEmailUser = user?.providerData?.every(
		(provider) => provider.providerId === 'password'
	);

	const handleToggleSync = async () => {
		const result = await updateSyncSettings({
			enabled: !syncSettings.enabled,
		});

		if (result.success) {
			setAlertConfig({
				title: 'Success',
				message: syncSettings.enabled
					? 'GitHub sync disabled'
					: 'GitHub sync enabled',
				icon: 'checkmark-circle-outline',
			});
		} else {
			setAlertConfig({
				title: 'Error',
				message: result.message,
				icon: 'alert-circle-outline',
			});
		}
		setAlertVisible(true);
	};

	const handleLinkGithub = async () => {
		const result = await linkGithubAccount();
		
		if (result && result.success !== undefined) {
			setAlertConfig({
				title: result.success ? 'Success' : 'Error',
				message: result.message || (result.success 
					? 'GitHub account linked successfully! Your profile has been updated.' 
					: 'Failed to link GitHub account'),
				icon: result.success
					? 'checkmark-circle-outline'
					: 'alert-circle-outline',
			});
			setAlertVisible(true);
		}
	};

	const handleThemeChange = async (mode: 'light' | 'dark' | 'system') => {
		console.log(`[Settings] 👆 User selected theme: ${mode}`);
		await setThemeMode(mode);
		console.log(`[Settings] ✅ Theme change completed for: ${mode}`);
	};

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: colors.neutral }]}>
			<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
				<Header title="Settings" subtitle="Customize your experience" />
				
				{/* Appearance Section */}
				<View style={styles.section}>
					<StyledText
						variant="semibold"
						style={[styles.sectionTitle, { color: colors.text }]}
					>
						Appearance
					</StyledText>

					<View style={[styles.card, { backgroundColor: colors.surface }]}>
						<StyledText
							variant="medium"
							style={[styles.subtitle, { color: colors.textSecondary }]}
						>
							Choose your preferred theme
						</StyledText>

						{/* Light Mode Option */}
						<TouchableOpacity
							onPress={() => handleThemeChange('light')}
							style={[
								styles.themeOption,
								themeMode === 'light' && styles.themeOptionSelected,
								themeMode === 'light' 
									? { backgroundColor: colors.actionOpacity10, borderColor: colors.action, borderWidth: 2 }
									: { backgroundColor: colors.grayOpacity }
							]}
						>
							<View style={styles.themeOptionContent}>
								<View style={[
									styles.themeIconContainer,
									{ backgroundColor: themeMode === 'light' ? colors.actionOpacity20 : colors.borderLight }
								]}>
									<Ionicons
										name="sunny"
										size={24}
										color={themeMode === 'light' ? colors.action : colors.textMuted}
									/>
								</View>
								<View>
									<StyledText
										variant="semibold"
										style={{ color: themeMode === 'light' ? colors.action : colors.text }}
									>
										Light Mode
									</StyledText>
									<StyledText
										variant="light"
										style={[styles.themeOptionSubtext, { color: colors.textSecondary }]}
									>
										Always use light theme
									</StyledText>
								</View>
							</View>
							{themeMode === 'light' && (
								<Ionicons name="checkmark-circle" size={24} color={colors.action} />
							)}
						</TouchableOpacity>

						{/* Dark Mode Option */}
						<TouchableOpacity
							onPress={() => handleThemeChange('dark')}
							style={[
								styles.themeOption,
								themeMode === 'dark' && styles.themeOptionSelected,
								themeMode === 'dark' 
									? { backgroundColor: colors.actionOpacity10, borderColor: colors.action, borderWidth: 2 }
									: { backgroundColor: colors.grayOpacity }
							]}
						>
							<View style={styles.themeOptionContent}>
								<View style={[
									styles.themeIconContainer,
									{ backgroundColor: themeMode === 'dark' ? colors.actionOpacity20 : colors.borderLight }
								]}>
									<Ionicons
										name="moon"
										size={24}
										color={themeMode === 'dark' ? colors.action : colors.textMuted}
									/>
								</View>
								<View>
									<StyledText
										variant="semibold"
										style={{ color: themeMode === 'dark' ? colors.action : colors.text }}
									>
										Dark Mode
									</StyledText>
									<StyledText
										variant="light"
										style={[styles.themeOptionSubtext, { color: colors.textSecondary }]}
									>
										Always use dark theme
									</StyledText>
								</View>
							</View>
							{themeMode === 'dark' && (
								<Ionicons name="checkmark-circle" size={24} color={colors.action} />
							)}
						</TouchableOpacity>

						{/* System Default Option */}
						<TouchableOpacity
							onPress={() => handleThemeChange('system')}
							style={[
								styles.themeOption,
								styles.themeOptionLast,
								themeMode === 'system' && styles.themeOptionSelected,
								themeMode === 'system' 
									? { backgroundColor: colors.actionOpacity10, borderColor: colors.action, borderWidth: 2 }
									: { backgroundColor: colors.grayOpacity }
							]}
						>
							<View style={styles.themeOptionContent}>
								<View style={[
									styles.themeIconContainer,
									{ backgroundColor: themeMode === 'system' ? colors.actionOpacity20 : colors.borderLight }
								]}>
									<Ionicons
										name="phone-portrait"
										size={24}
										color={themeMode === 'system' ? colors.action : colors.textMuted}
									/>
								</View>
								<View>
									<StyledText
										variant="semibold"
										style={{ color: themeMode === 'system' ? colors.action : colors.text }}
									>
										System Default
									</StyledText>
									<StyledText
										variant="light"
										style={[styles.themeOptionSubtext, { color: colors.textSecondary }]}
									>
										Match device theme
									</StyledText>
								</View>
							</View>
							{themeMode === 'system' && (
								<Ionicons name="checkmark-circle" size={24} color={colors.action} />
							)}
						</TouchableOpacity>
					</View>
				</View>

				{/* GitHub Integration Section */}
				<View style={styles.section}>
					<StyledText
						variant="semibold"
						style={[styles.sectionTitle, { color: colors.text }]}
					>
						GitHub Integration
					</StyledText>

					<View style={[styles.card, { backgroundColor: colors.surface }]}>
						{/* Email/Password User - Not Yet Linked */}
						{isEmailUser && !isGitHubUser ? (
							<View style={styles.githubConnectContainer}>
								<Ionicons
									name="logo-github"
									size={48}
									color={colors.textMuted}
								/>
								<StyledText
									variant="semibold"
									style={[styles.githubTitle, { color: colors.text }]}
								>
									Connect GitHub Account
								</StyledText>
								<StyledText
									variant="light"
									style={[styles.githubSubtitle, { color: colors.textSecondary }]}
								>
									Link your GitHub account to automatically sync commits and update your profile picture
								</StyledText>
								<TouchableOpacity
									onPress={handleLinkGithub}
									disabled={loading}
									style={[styles.githubButton, { backgroundColor: colors.primary }]}
								>
									{loading ? (
										<ActivityIndicator size="small" color="#ffffff" />
									) : (
										<>
											<Ionicons name="logo-github" size={20} color="#ffffff" />
											<StyledText
												variant="semibold"
												style={styles.githubButtonText}
											>
												Connect GitHub
											</StyledText>
										</>
									)}
								</TouchableOpacity>
							</View>
						) : !isGitHubUser ? (
							/* No GitHub at all */
							<View style={styles.githubConnectContainer}>
								<Ionicons
									name="logo-github"
									size={48}
									color={colors.textMuted}
								/>
								<StyledText
									variant="medium"
									style={[styles.githubNoAccount, { color: colors.textSecondary }]}
								>
									Sign in with GitHub to sync your commits
								</StyledText>
							</View>
						) : (
							/* GitHub User - Full Sync Features */
							<>
								{/* Enable Sync Toggle */}
								<View style={styles.syncToggleRow}>
									<View style={styles.syncToggleText}>
										<StyledText
											variant="semibold"
											style={[styles.syncTitle, { color: colors.text }]}
										>
											Enable GitHub Sync
										</StyledText>
										<StyledText
											variant="light"
											style={[styles.syncSubtitle, { color: colors.textSecondary }]}
										>
											Automatically sync and create daily commits from your GitHub activity
										</StyledText>
									</View>
									<Switch
										value={syncSettings.enabled}
										onValueChange={handleToggleSync}
										trackColor={{
											false: '#cbd5e1',
											true: '#7C3AED',
										}}
										thumbColor="#ffffff"
									/>
								</View>

								{/* Last Sync Info */}
								{syncSettings.lastSyncDate && (
									<View style={[styles.lastSyncContainer, { borderTopColor: colors.border }]}>
										<StyledText
											variant="light"
											style={[styles.lastSyncText, { color: colors.textSecondary }]}
										>
											Last synced:{' '}
											{new Date(syncSettings.lastSyncDate).toLocaleString()}
										</StyledText>
									</View>
								)}
							</>
						)}
					</View>
				</View>

				<Alert
					visible={alertVisible}
					title={alertConfig.title}
					message={alertConfig.message}
					icon={alertConfig.icon}
					onClose={() => setAlertVisible(false)}
					buttons={[{ text: 'OK', style: 'default' }]}
				/>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		padding: 24,
	},
	section: {
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 20,
		marginBottom: 12,
	},
	card: {
		borderRadius: 16,
		padding: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
	},
	subtitle: {
		fontSize: 14,
		marginBottom: 16,
	},
	themeOption: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: 16,
		borderRadius: 12,
		marginBottom: 12,
	},
	themeOptionLast: {
		marginBottom: 0,
	},
	themeOptionSelected: {
		// Selected state is handled by inline styles for colors
	},
	themeOptionContent: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	themeIconContainer: {
		width: 48,
		height: 48,
		borderRadius: 24,
		alignItems: 'center',
		justifyContent: 'center',
	},
	themeOptionSubtext: {
		fontSize: 12,
	},
	// GitHub Integration styles
	githubConnectContainer: {
		alignItems: 'center',
		paddingVertical: 16,
	},
	githubTitle: {
		fontSize: 18,
		marginTop: 12,
		marginBottom: 8,
	},
	githubSubtitle: {
		textAlign: 'center',
		marginBottom: 16,
		paddingHorizontal: 16,
	},
	githubButton: {
		borderRadius: 16,
		paddingHorizontal: 24,
		paddingVertical: 12,
		flexDirection: 'row',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	githubButtonText: {
		color: '#FFFFFF',
		marginLeft: 8,
	},
	githubNoAccount: {
		marginTop: 12,
		textAlign: 'center',
	},
	syncToggleRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	syncToggleText: {
		flex: 1,
		marginRight: 16,
	},
	syncTitle: {
		fontSize: 18,
		marginBottom: 4,
	},
	syncSubtitle: {
		fontSize: 14,
	},
	lastSyncContainer: {
		marginTop: 16,
		paddingTop: 16,
		borderTopWidth: 1,
	},
	lastSyncText: {
		fontSize: 18,
		textAlign: 'center',
	},
});

import Header from '@/components/layout/Header';
import StyledText from '@/components/ui/StyledText';
import Alert from '@/components/ui/Alert';
import { useGithubCommits } from '@/hooks/useGithubCommits';
import { useAuthStore } from '@/store/AuthStore';
import { useState } from 'react';
import {
	ActivityIndicator,
	ScrollView,
	Switch,
	TouchableOpacity,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCommit } from '@/hooks/useCommit';

export default function SettingsScreen() {
	const { user } = useAuthStore();
	const { syncSettings, updateSyncSettings, syncGithubCommits, loading } =
		useGithubCommits();
    const { fetchCommits } = useCommit();
	const [alertVisible, setAlertVisible] = useState<boolean>(false);
	const [alertConfig, setAlertConfig] = useState({
		title: '',
		message: '',
		icon: 'checkmark-circle-outline' as keyof typeof Ionicons.glyphMap,
	});

	const isGitHubUser = user?.providerData?.some(
		(provider) => provider.providerId === 'github.com'
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

	const handleToggleAutoCreate = async () => {
		const result = await updateSyncSettings({
			autoCreateCommits: !syncSettings.autoCreateCommits,
		});

		if (result.success) {
			setAlertConfig({
				title: 'Success',
				message: syncSettings.autoCreateCommits
					? 'Auto-create disabled'
					: 'Auto-create enabled',
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

	const handleManualSync = async () => {
        if (!isGitHubUser) {
            setAlertConfig({
                title: 'Error',
                message: 'Please sign in with GitHub to sync commits',
                icon: 'alert-circle-outline',
            });
            setAlertVisible(true);
            return;
        }

        const result = await syncGithubCommits();

        if (result.success && syncSettings.autoCreateCommits) {
            await fetchCommits();
        }

        setAlertConfig({
            title: result.success ? 'Success' : 'Error',
            message: result.message,
            icon: result.success
                ? 'checkmark-circle-outline'
                : 'alert-circle-outline',
        });
        setAlertVisible(true);
    };

	return (
		<SafeAreaView className="flex-1 bg-neutral">
			<ScrollView className="flex-1 px-6 py-6">
				<Header title="Settings" subtitle="Customize your experience" />

				{/* GitHub Integration Section */}
				<View className="mb-6">
					<StyledText
						variant="semibold"
						className="text-primary text-xl mb-3"
					>
						GitHub Integration
					</StyledText>

					<View className="bg-white rounded-2xl p-5 shadow-md">
						{!isGitHubUser ? (
							<View className="items-center py-4">
								<Ionicons
									name="logo-github"
									size={48}
									color="#94a3b8"
								/>
								<StyledText
									variant="medium"
									className="text-primary/60 mt-3 text-center"
								>
									Sign in with GitHub to sync your commits
								</StyledText>
							</View>
						) : (
							<>
								{/* Enable Sync Toggle */}
								<View className="flex-row justify-between items-center mb-4 pb-4 border-b border-gray-200">
									<View className="flex-1">
										<StyledText
											variant="semibold"
											className="text-primary text-lg"
										>
											Enable Sync
										</StyledText>
										<StyledText
											variant="light"
											className="text-primary/60 text-sm"
										>
											Automatically fetch GitHub commits
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

								{/* Auto-Create Commits Toggle */}
								<View className="flex-row justify-between items-center mb-4 pb-4 border-b border-gray-200">
									<View className="flex-1">
										<StyledText
											variant="semibold"
											className="text-primary text-lg"
										>
											Auto-Create Commits
										</StyledText>
										<StyledText
											variant="light"
											className="text-primary/60 text-sm"
										>
											Create daily commits from GitHub
											activity
										</StyledText>
									</View>
									<Switch
										value={syncSettings.autoCreateCommits}
										onValueChange={handleToggleAutoCreate}
										trackColor={{
											false: '#cbd5e1',
											true: '#7C3AED',
										}}
										thumbColor="#ffffff"
										disabled={!syncSettings.enabled}
									/>
								</View>

								{/* Manual Sync Button */}
								<TouchableOpacity
									onPress={handleManualSync}
									disabled={loading || !syncSettings.enabled}
									className={`rounded-2xl py-3 items-center flex-row justify-center ${
										syncSettings.enabled
											? 'bg-action'
											: 'bg-gray-300'
									}`}
								>
									{loading ? (
										<ActivityIndicator
											size="small"
											color="#ffffff"
										/>
									) : (
										<>
											<Ionicons
												name="sync"
												size={20}
												color="#ffffff"
											/>
											<StyledText
												variant="semibold"
												className="text-white ml-2"
											>
												Sync Now
											</StyledText>
										</>
									)}
								</TouchableOpacity>

								{/* Last Sync Info */}
								{syncSettings.lastSyncDate && (
									<View className="mt-4 pt-4 border-t border-gray-200">
										<StyledText
											variant="light"
											className="text-primary/60 text-lg text-center"
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

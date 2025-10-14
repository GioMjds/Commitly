import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { database, firestore } from '@/configs/firebase';
import { useAuthStore } from '@/store/AuthStore';
import axios from 'axios';
import { get, onValue, ref, set } from 'firebase/database';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { GitHubCommit, SyncSettings } from '@/types/GithubSettings.types';

export const useGithubCommits = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const [syncSettings, setSyncSettings] = useState<SyncSettings>({
		enabled: false,
		lastSyncDate: null,
		autoCreateCommits: false,
		dailySyncEnabled: false,
		dailySyncTime: '23:59',
		lastDailySyncDate: null,
	});

	const { user } = useAuthStore();

	useEffect(() => {
		if (!user) return;

		const settingsRef = ref(database, `users/${user.uid}/githubSync`);
		const unsubscribe = onValue(settingsRef, (snapshot) => {
			if (snapshot.exists()) setSyncSettings(snapshot.val());
		});

		const webhookRef = ref(database, `users/${user.uid}/githubWebhook/trigger`);
		const webhookUnsubscribe = onValue(webhookRef, (snapshot) => {
			if (snapshot.exists() && snapshot.val() === true) {
				syncGithubCommits().then(() => {
					set(webhookRef, false);
				});
			}
		});

		return () => {
			unsubscribe();
			webhookUnsubscribe();
		};
	}, [user]);

	useEffect(() => {
		if (!user || !syncSettings.enabled || !syncSettings.dailySyncEnabled) return;

		const checkDailySync = () => {
			const now = new Date();
			const today = now.toISOString().split('T')[0];

			const [targetHour, targetMinute] = (syncSettings.dailySyncTime || '23:59').split(':').map(Number);

			if (syncSettings.lastDailySyncDate === today) {
				return;
			}

			const currentHour = now.getHours();
			const currentMinute = now.getMinutes();
			
			const isPastSyncTime = 
				currentHour > targetHour || 
				(currentHour === targetHour && currentMinute >= targetMinute);
			
			if (isPastSyncTime) {
				syncGithubCommits().then(() => {
					updateSyncSettings({ lastDailySyncDate: today });
				});
			}
		};

		checkDailySync();

		const interval = setInterval(checkDailySync, 60 * 1000);
		
		return () => clearInterval(interval);
	}, [user, syncSettings.enabled, syncSettings.dailySyncEnabled, syncSettings.dailySyncTime, syncSettings.lastDailySyncDate]);

	const fetchGithubCommits = async (
		username: string,
		token: string,
		sinceDate?: Date
	): Promise<GitHubCommit[]> => {
		try {
			let searchQuery = `author:${username}`;
			if (sinceDate) {
				const sinceDateStr = sinceDate.toISOString().split('T')[0];
				searchQuery += ` committer-date:>=${sinceDateStr}`;
			}
			
			const response = await axios.get(
				`https://api.github.com/search/commits`,
				{
					params: {
						q: searchQuery,
						sort: 'committer-date',
						order: 'desc',
						per_page: 100,
					},
					headers: {
						Authorization: `Bearer ${token}`,
						Accept: 'application/vnd.github.cloak-preview+json',
					},
				}
			);

			const commits = response.data.items.map((commit: any) => ({
				sha: commit.sha,
				message: commit.commit.message,
				date: commit.commit.committer.date,
				repo: commit.repository.full_name,
				url: commit.html_url,
			}));

			return commits;
		} catch (error) {
			console.error('❌ Error fetching GitHub commits:', error);
			return [];
		}
	};

	const updateSyncSettings = async (settings: Partial<SyncSettings>) => {
		if (!user) return { success: false, message: 'User not authenticated' };

		try {
			const settingsRef = ref(database, `users/${user.uid}/githubSync`);
			await set(settingsRef, {
				...syncSettings,
				...settings,
			});

			return { success: true, message: 'Settings updated' };
		} catch (error) {
			return {
				success: false,
				message: `Failed to update settings: ${error}`,
			};
		}
	};

	const syncGithubCommits = async () => {
        if (!user) return { success: false, message: 'User not authenticated' };
        setLoading(true);

        try {
            const token = await SecureStore.getItemAsync(
                `github_token_${user.uid}`
            );

            if (!token) {
                return {
                    success: false,
                    message: 'GitHub token not found. Please re-authenticate with GitHub.',
                };
            }

            const githubDataSnapshot = await get(
                ref(database, `users/${user.uid}/github`)
            );

            if (!githubDataSnapshot.exists()) {
                return {
                    success: false,
                    message: 'GitHub username not found.',
                };
            }

            const username = githubDataSnapshot.val().username;

            console.log('🔄 Starting GitHub sync...');
            console.log('📅 Last sync date:', syncSettings.lastSyncDate);

            // Calculate lookback date - always check at least the last 48 hours
            const now = new Date();
            const lookbackDate = syncSettings.lastSyncDate
                ? new Date(Math.min(
                    new Date(syncSettings.lastSyncDate).getTime() - 60 * 60 * 1000, // Last sync - 1 hour
                    now.getTime() - 48 * 60 * 60 * 1000 // Or 48 hours ago, whichever is more recent
                ))
                : new Date(now.getTime() - 48 * 60 * 60 * 1000);

            console.log('📅 Lookback date:', lookbackDate.toISOString());
            
            const commits = await fetchGithubCommits(username, token, lookbackDate);

            console.log(`✅ Fetched ${commits.length} commits from GitHub`);

            // Get the start of today in local timezone
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            // Filter commits: Include ALL commits from today + any new commits from before
            const lastSyncDate = syncSettings.lastSyncDate
                ? new Date(syncSettings.lastSyncDate)
                : new Date(now.getTime() - 24 * 60 * 60 * 1000);

            const newCommits = commits.filter((commit) => {
                const commitDate = new Date(commit.date);
                // Include if commit is from today OR after last sync
                const isFromToday = commitDate >= todayStart;
                const isAfterLastSync = commitDate > lastSyncDate;
                return isFromToday || isAfterLastSync;
            });

            console.log(`🆕 Found ${newCommits.length} new/today commits to process`);

            if (newCommits.length > 0) {
                const createdCount = await createDailyCommitsFromGitHub(
                    newCommits
                );

                const commitsRef = ref(
                    database,
                    `users/${user.uid}/githubCommits`
                );
                await set(commitsRef, {
                    commits: newCommits,
                    lastSync: new Date().toISOString(),
                    createdInFirestore: createdCount,
                });

                await updateSyncSettings({
                    lastSyncDate: new Date().toISOString(),
                });

                console.log(`✅ Created ${createdCount} daily commit entries`);

                return {
                    success: true,
                    commits: newCommits,
                    message: `✅ Synced ${newCommits.length} GitHub commits and created ${createdCount} daily commits!`,
                };
            }
            
            await updateSyncSettings({
                lastSyncDate: new Date().toISOString(),
            });

            return {
                success: true,
                commits: [],
                message: `✅ All caught up! No new commits since last sync.`,
            };
        } catch (error: any) {
            console.error('❌ Sync error:', error);
            if (error?.response?.status === 401) {
                return {
                    success: false,
                    message: 'GitHub token expired. Please re-authenticate with GitHub.',
                };
            }
            return { success: false, message: `Sync failed: ${error.message}` };
        } finally {
            setLoading(false);
        }
    };

    const createDailyCommitsFromGitHub = async (githubCommits: GitHubCommit[]): Promise<number> => {
        if (!user) return 0;
        let createdCount = 0;

        const commitsByDate = githubCommits.reduce((acc, commit) => {
            const date = new Date(commit.date).toISOString().split("T")[0];
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(commit);
            return acc;
        }, {} as Record<string, GitHubCommit[]>);

        for (const [date, commits] of Object.entries(commitsByDate)) {
            try {
                const existingQuery = query(
                    collection(firestore, "commits"),
                    where("userId", "==", user.uid),
                    where("date", "==", date)
                );
                const existingDocs = await getDocs(existingQuery);

                if (existingDocs.empty) {
                    const commitMessages = commits
                        .map((c: GitHubCommit) => `• ${c.message.split('\n')[0]} (${c.repo})`)
                        .join("\n");

                    const now = new Date();
                    const commitData = {
                        userId: user.uid,
                        note: `${commitMessages}`,
                        tag: "github-sync",
                        mood: "😊" as const,
                        createdAt: new Date(commits[0].date),
                        updatedAt: now,
                        date: date,
                        githubCommits: commits.map((c: GitHubCommit) => ({
                            sha: c.sha,
                            message: c.message,
                            repo: c.repo,
                            url: c.url,
                            date: c.date,
                        })),
                    };

                    await addDoc(collection(firestore, "commits"), commitData);
                    createdCount++;
                }
            } catch (error) {
                console.error(`❌ Error creating commit for ${date}:`, error);
            }
        };
        return createdCount;
    };

	return {
		syncSettings,
		updateSyncSettings,
		syncGithubCommits,
		loading,
	};
};

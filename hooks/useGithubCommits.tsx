import axios from 'axios';
import { useAuthStore } from '@/store/AuthStore';
import { database, firestore } from '@/configs/firebase';
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { addDoc, collection, where, query, getDocs } from 'firebase/firestore';
import { get, onValue, ref, set } from 'firebase/database';

interface GitHubCommit {
	sha: string;
	message: string;
	date: string;
	repo: string;
	url: string;
}

interface SyncSettings {
	enabled: boolean;
	lastSyncDate: string | null;
	autoCreateCommits: boolean;
}

export const useGithubCommits = () => {
	const [syncSettings, setSyncSettings] = useState<SyncSettings>({
		enabled: false,
		lastSyncDate: null,
		autoCreateCommits: false,
	});
	const [loading, setLoading] = useState<boolean>(false);

	const { user } = useAuthStore();

	useEffect(() => {
		if (!user) return;

		const settingsRef = ref(database, `users/${user.uid}/githubSync`);
		const unsubscribe = onValue(settingsRef, (snapshot) => {
			if (snapshot.exists()) setSyncSettings(snapshot.val());
		});

		return () => unsubscribe();
	}, [user]);

	const fetchGithubCommits = async (
		username: string,
		token: string
	): Promise<GitHubCommit[]> => {
		try {
			const response = await axios.get(
				`https://api.github.com/search/commits`,
				{
					params: {
						q: `author:${username}`,
						sort: 'committer-date',
						order: 'desc',
						per_page: 50,
					},
					headers: {
						Authorization: `Bearer ${token}`,
						Accept: 'application/vnd.github.cloak-preview+json',
					},
				}
			);

			return response.data.items.map((commit: any) => ({
				sha: commit.sha,
				message: commit.commit.message,
				date: commit.commit.committer.date,
				repo: commit.repository.full_name,
				url: commit.html_url,
			}));
		} catch (error) {
			console.error('Error fetching GitHub commits:', error);
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
					message:
						'GitHub token not found. Please re-authenticate with GitHub.',
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
			const commits = await fetchGithubCommits(username, token);

			const lastSyncDate = syncSettings.lastSyncDate
				? new Date(syncSettings.lastSyncDate)
				: new Date(Date.now() - 24 * 60 * 60 * 1000);

			const newCommits = commits.filter(
				(commit) => new Date(commit.date) > lastSyncDate
			);

			// ✅ NEW: Auto-create DailyCommits in Firestore if enabled
			if (syncSettings.autoCreateCommits && newCommits.length > 0) {
				const createdCount = await createDailyCommitsFromGitHub(
					newCommits
				);

				// Store in Realtime Database for tracking
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

				return {
					success: true,
					commits: newCommits,
					message: `Synced ${newCommits.length} GitHub commits and created ${createdCount} daily commits.`,
				};
			}

			// Store in Realtime Database only
			const commitsRef = ref(database, `users/${user.uid}/githubCommits`);
			await set(commitsRef, {
				commits: newCommits,
				lastSync: new Date().toISOString(),
			});

			await updateSyncSettings({
				lastSyncDate: new Date().toISOString(),
			});

			return {
				success: true,
				commits: newCommits,
				message: `Found ${newCommits.length} new commits synced.`,
			};
		} catch (error: any) {
			if (error?.response?.status === 401) {
				return {
					success: false,
					message:
						'GitHub token expired. Please re-authenticate with GitHub.',
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

        // Group commits by date
        const commitsByDate = githubCommits.reduce((acc, commit) => {
            const date = new Date(commit.date).toISOString().split("T")[0];
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(commit);
            return acc;
        }, {} as Record<string, GitHubCommit[]>);

        // Create one DailyCommit per day
        for (const [date, commits] of Object.entries(commitsByDate)) {
            try {
                // Check if commit already exists for this date
                const existingQuery = query(
                    collection(firestore, "commits"),
                    where("userId", "==", user.uid),
                    where("date", "==", date)
                );
                const existingDocs = await getDocs(existingQuery);

                if (existingDocs.empty) {
                    // Create summary of all commits for that day
                    const commitMessages = commits
                        .map((c) => `• ${c.message} (${c.repo})`)
                        .join("\n");

                    const now = new Date();
                    const commitData = {
                        userId: user.uid,
                        note: `GitHub Activity:\n${commitMessages}`,
                        tag: "github-sync",
                        mood: "😊" as const,
                        createdAt: new Date(commits[0].date),
                        updatedAt: now,
                        date: date,
                    };

                    await addDoc(collection(firestore, "commits"), commitData);
                    createdCount++;
                }
            } catch (error) {
                console.error(`Error creating commit for ${date}:`, error);
            }
        }

        return createdCount;
    };

	return {
		syncSettings,
		updateSyncSettings,
		syncGithubCommits,
		loading,
	};
};

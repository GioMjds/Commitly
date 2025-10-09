import { database, firestore } from '@/configs/firebase';
import { useAuthStore } from '@/store/AuthStore';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { get, onValue, ref, set } from 'firebase/database';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

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

		// Listen for webhook triggers from GitHub Actions or external services
		const webhookRef = ref(database, `users/${user.uid}/githubWebhook/trigger`);
		const webhookUnsubscribe = onValue(webhookRef, (snapshot) => {
			if (snapshot.exists() && snapshot.val() === true) {
				console.log('🔔 GitHub webhook trigger detected - auto-syncing...');
				// Auto-sync when webhook fires (we'll call it inline to avoid dependency)
				syncGithubCommits().then(() => {
					// Reset trigger after sync
					set(webhookRef, false);
				});
			}
		});

		return () => {
			unsubscribe();
			webhookUnsubscribe();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user]);

	const fetchGithubCommits = async (
		username: string,
		token: string,
		sinceDate?: Date
	): Promise<GitHubCommit[]> => {
		try {
			console.log('🔍 Fetching GitHub commits for user:', username);
			
			// Build query with optional date filter
			let searchQuery = `author:${username}`;
			if (sinceDate) {
				// Use ISO date format for GitHub search (YYYY-MM-DD)
				const sinceDateStr = sinceDate.toISOString().split('T')[0];
				searchQuery += ` committer-date:>=${sinceDateStr}`;
				console.log(`📅 Filtering commits since: ${sinceDateStr}`);
			}
			
			const response = await axios.get(
				`https://api.github.com/search/commits`,
				{
					params: {
						q: searchQuery,
						sort: 'committer-date',
						order: 'desc',
						per_page: 100, // Increased to capture more recent commits
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

			console.log(`✅ Found ${commits.length} total GitHub commits`);
			
			// Log most recent commits with details
			if (commits.length > 0) {
				console.log('\n📋 Recent Commits:');
				commits.slice(0, 5).forEach((commit: GitHubCommit, index: number) => {
					console.log(`\n${index + 1}. Repository: ${commit.repo}`);
					console.log(`   Message: ${commit.message.split('\n')[0]}`);
					console.log(`   Date: ${new Date(commit.date).toLocaleString()}`);
					console.log(`   SHA: ${commit.sha.substring(0, 7)}`);
					console.log(`   URL: ${commit.url}`);
				});
				console.log('\n');
			}

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

		console.log('\n🔄 Starting GitHub sync process...');
		console.log(`User ID: ${user.uid}`);

		try {
			const token = await SecureStore.getItemAsync(
				`github_token_${user.uid}`
			);

			if (!token) {
				console.log('❌ GitHub token not found in secure storage');
				return {
					success: false,
					message:
						'GitHub token not found. Please re-authenticate with GitHub.',
				};
			}

			console.log('✅ GitHub token retrieved from secure storage');

			const githubDataSnapshot = await get(
				ref(database, `users/${user.uid}/github`)
			);

			if (!githubDataSnapshot.exists()) {
				console.log('❌ GitHub username not found in database');
				return {
					success: false,
					message: 'GitHub username not found.',
				};
			}

			const username = githubDataSnapshot.val().username;
			console.log(`✅ GitHub username: ${username}`);
			
			// Use a more inclusive time window - go back 48 hours to catch recent commits
			const lookbackDate = syncSettings.lastSyncDate
				? new Date(new Date(syncSettings.lastSyncDate).getTime() - 60 * 60 * 1000) // 1 hour buffer
				: new Date(Date.now() - 48 * 60 * 60 * 1000); // 48 hours default
			
			console.log(`📅 Fetching commits since: ${lookbackDate.toLocaleString()}`);
			
			const commits = await fetchGithubCommits(username, token, lookbackDate);

			// Filter to only truly new commits (after lastSyncDate, not lookbackDate)
			const lastSyncDate = syncSettings.lastSyncDate
				? new Date(syncSettings.lastSyncDate)
				: new Date(Date.now() - 24 * 60 * 60 * 1000);

			console.log(`📅 Last sync date (filtering): ${lastSyncDate.toLocaleString()}`);

			const newCommits = commits.filter(
				(commit) => new Date(commit.date) > lastSyncDate
			);

			console.log(`🆕 New commits since last sync: ${newCommits.length}`);

			// ✅ Always auto-create DailyCommits in Firestore
			if (newCommits.length > 0) {
				console.log('\n📝 Creating daily commits in Firestore...');
				
				const createdCount = await createDailyCommitsFromGitHub(
					newCommits
				);

				console.log(`✅ Created ${createdCount} daily commits in Firestore`);

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

				console.log('✅ Sync data saved to Realtime Database');

				await updateSyncSettings({
					lastSyncDate: new Date().toISOString(),
				});

				console.log('✅ Sync settings updated');
				console.log('🎉 GitHub sync completed successfully!\n');

				return {
					success: true,
					commits: newCommits,
					message: `✅ Synced ${newCommits.length} GitHub commits and created ${createdCount} daily commits!`,
				};
			}

			// No new commits
			console.log('ℹ️ No new commits to sync');
			
			await updateSyncSettings({
				lastSyncDate: new Date().toISOString(),
			});

			console.log('✅ Sync completed (no new commits)\n');

			return {
				success: true,
				commits: [],
				message: `✅ All caught up! No new commits since last sync.`,
			};
		} catch (error: any) {
			console.error('❌ Sync error:', error);
			
			if (error?.response?.status === 401) {
				console.log('❌ GitHub token expired or invalid');
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

        console.log(`\n📦 Processing ${githubCommits.length} GitHub commits for daily commit creation...`);

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

        const uniqueDates = Object.keys(commitsByDate).length;
        console.log(`📅 Grouped into ${uniqueDates} unique dates`);

        // Create one DailyCommit per day
        for (const [date, commits] of Object.entries(commitsByDate)) {
            try {
                console.log(`\n📆 Processing date: ${date} (${commits.length} commits)`);
                
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
                        .map((c: GitHubCommit) => `• ${c.message.split('\n')[0]} (${c.repo})`)
                        .join("\n");

                    console.log(`   Creating daily commit with ${commits.length} GitHub commits:`);
                    commits.forEach((c: GitHubCommit, i: number) => {
                        console.log(`   ${i + 1}. ${c.message.split('\n')[0]} [${c.repo}]`);
                    });

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
                    console.log(`   ✅ Daily commit created successfully`);
                } else {
                    console.log(`   ⏭️ Skipped - Daily commit already exists for this date`);
                }
            } catch (error) {
                console.error(`❌ Error creating commit for ${date}:`, error);
            }
        }

        console.log(`\n✅ Total daily commits created: ${createdCount}/${uniqueDates}`);
        return createdCount;
    };

	return {
		syncSettings,
		updateSyncSettings,
		syncGithubCommits,
		loading,
	};
};

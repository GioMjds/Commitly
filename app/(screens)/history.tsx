import Header from "@/components/layout/Header";
import CommitCard from "@/components/ui/CommitCard";
import FilterBar from "@/components/ui/FilterBar";
import StyledText from "@/components/ui/StyledText";
import { useCommit } from "@/hooks/useCommit";
import { useGithubCommits } from "@/hooks/useGithubCommits";
import { useAuthStore } from "@/store/AuthStore";
import { useCommitStore } from "@/store/CommitStore";
import { Ionicons } from "@expo/vector-icons";
import { isAfter, parseISO, subDays, subMonths, subYears } from 'date-fns';
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HistoryScreen() {
    const { user } = useAuthStore();
    const { commits, loading } = useCommitStore();
    const { fetchCommits } = useCommit();
    const { syncGithubCommits, loading: syncLoading } = useGithubCommits();
    const [refreshing, setRefreshing] = useState(false);
    
    // Filter states
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
    const [selectedDateRange, setSelectedDateRange] = useState<'all' | 'week' | 'month' | 'year'>('all');

    const isGitHubUser = user?.providerData?.some(
        (provider) => provider.providerId === 'github.com'
    );

    // Extract unique tags and repos from commits
    const availableTags = useMemo(() => {
        const tagSet = new Set<string>();
        commits.forEach(commit => {
            if (commit.tag) tagSet.add(commit.tag);
        });
        return Array.from(tagSet);
    }, [commits]);

    const availableRepos = useMemo(() => {
        const repoSet = new Set<string>();
        commits.forEach(commit => {
            if (commit.githubCommits) {
                commit.githubCommits.forEach(ghCommit => {
                    repoSet.add(ghCommit.repo);
                });
            }
        });
        return Array.from(repoSet);
    }, [commits]);

    // Filter commits based on selected filters
    const filteredCommits = useMemo(() => {
        let filtered = [...commits];

        // Filter by tag
        if (selectedTag) {
            filtered = filtered.filter(commit => commit.tag === selectedTag);
        }

        // Filter by repo
        if (selectedRepo) {
            filtered = filtered.filter(commit => 
                commit.githubCommits?.some(ghCommit => ghCommit.repo === selectedRepo)
            );
        }

        // Filter by date range
        if (selectedDateRange !== 'all') {
            const now = new Date();
            let cutoffDate: Date;

            switch (selectedDateRange) {
                case 'week':
                    cutoffDate = subDays(now, 7);
                    break;
                case 'month':
                    cutoffDate = subMonths(now, 1);
                    break;
                case 'year':
                    cutoffDate = subYears(now, 1);
                    break;
                default:
                    cutoffDate = new Date(0);
            }

            filtered = filtered.filter(commit => 
                isAfter(parseISO(commit.date), cutoffDate)
            );
        }

        return filtered;
    }, [commits, selectedTag, selectedRepo, selectedDateRange]);

    useFocusEffect(
        useCallback(() => {
            if (user) fetchCommits();
        }, [user, fetchCommits])
    );

    const onRefresh = useCallback(async () => {
        if (!user) return;
        setRefreshing(true);
        await fetchCommits();
        setRefreshing(false);
    }, [user, fetchCommits]);

    const handleSyncNow = async () => {
        if (!isGitHubUser) return;
        const result = await syncGithubCommits();

        if (result.success) await fetchCommits();
    };

    const renderEmpty = () => (
        <View className="items-center py-20">
            {isGitHubUser ? (
                <>
                    <Ionicons name="logo-github" size={60} color="#7C3AED" />
                    <StyledText variant="semibold" className="text-primary text-2xl mb-2 mt-4">
                        No commits synced yet
                    </StyledText>
                    <StyledText variant="light" className="text-primary/60 text-center mb-6 px-8">
                        Go to Settings and sync your GitHub commits to start building your streak!
                    </StyledText>
                    <TouchableOpacity
                        onPress={() => router.push('/settings')}
                        className="bg-action rounded-2xl px-6 py-3"
                    >
                        <StyledText variant="semibold" className="text-white text-lg">
                            Go to Settings
                        </StyledText>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <StyledText className="text-6xl mb-4">🔗</StyledText>
                    <StyledText variant="semibold" className="text-primary text-2xl mb-2">
                        Connect GitHub First
                    </StyledText>
                    <StyledText variant="light" className="text-primary/60 text-center mb-6 px-8">
                        Sign in with GitHub to automatically track your coding activity!
                    </StyledText>
                    <TouchableOpacity
                        onPress={() => router.push('/settings')}
                        className="bg-action rounded-2xl px-6 py-3"
                    >
                        <StyledText variant="semibold" className="text-white text-lg">
                            Go to Settings
                        </StyledText>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );

    if (loading && commits.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-neutral justify-center items-center">
                <ActivityIndicator size="large" color="#0891b2" />
                <StyledText variant="medium" className="text-primary mt-4">
                    Loading your commits...
                </StyledText>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-neutral">
            <View className="flex-1 px-6 py-6">
                {/* Header */}
                <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-1">
                        <Header 
                            title="Commit History" 
                            subtitle="Your journey of continuous improvement" 
                        />
                    </View>
                </View>

                {/* Filter Bar */}
                <FilterBar
                    tags={availableTags}
                    repos={availableRepos}
                    selectedTag={selectedTag}
                    selectedRepo={selectedRepo}
                    selectedDateRange={selectedDateRange}
                    onTagChange={setSelectedTag}
                    onRepoChange={setSelectedRepo}
                    onDateRangeChange={setSelectedDateRange}
                />

                <FlatList
                    data={filteredCommits}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <CommitCard commit={item} /> }
                    ListEmptyComponent={renderEmpty}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#7C3AED']}
                            tintColor="#7C3AED"
                        />
                    }
                />

                {/* Floating Sync Button */}
                {isGitHubUser && (
                    <TouchableOpacity
                        onPress={handleSyncNow}
                        disabled={syncLoading || loading}
                        className={`absolute bottom-6 right-6 rounded-full p-4 shadow-lg flex-row items-center ${
                            syncLoading ? 'bg-gray-400' : 'bg-action'
                        }`}
                        style={{
                            elevation: 3,
                            shadowColor: '#000',
                            shadowOffset: { width: 2, height: 2 },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                        }}
                    >
                        {syncLoading ? (
                            <ActivityIndicator size="small" color="#E6EEF2" />
                        ) : (
                            <>
                                <Ionicons name="sync" size={24} color="#E6EEF2" />
                                <StyledText className="ml-2 text-neutral" variant="medium">
                                    Sync Latest Commit
                                </StyledText>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

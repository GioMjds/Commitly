import Header from "@/components/layout/Header";
import CommitCard from "@/components/ui/CommitCard";
import StyledText from "@/components/ui/StyledText";
import { useCommit } from "@/hooks/useCommit";
import { useGithubCommits } from "@/hooks/useGithubCommits";
import { useAuthStore } from "@/store/AuthStore";
import { useCommitStore } from "@/store/CommitStore";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HistoryScreen() {
    const { user } = useAuthStore();
    const { commits, loading } = useCommitStore();
    const { fetchCommits } = useCommit();
    const { syncGithubCommits, loading: syncLoading } = useGithubCommits();
    const [refreshing, setRefreshing] = useState(false);

    const isGitHubUser = user?.providerData?.some(
        (provider) => provider.providerId === 'github.com'
    );

    useFocusEffect(
        useCallback(() => {
            if (user) fetchCommits();
        }, [user, fetchCommits])
    );

    const onRefresh = useCallback(async () => {
        if (!user) return;
        setRefreshing(true);
        console.log('🔄 Pull-to-refresh triggered in history');
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
                            title="History" 
                            subtitle="Your journey of continuous improvement" 
                        />
                    </View>
                </View>

                <FlatList
                    data={commits}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <CommitCard
                            commit={item}
                        />
                    )}
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
                            elevation: 5,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
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

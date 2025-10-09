import Header from "@/components/layout/Header";
import CommitCard from "@/components/ui/CommitCard";
import StyledText from "@/components/ui/StyledText";
import { useCommit } from "@/hooks/useCommit";
import { useAuthStore } from "@/store/AuthStore";
import { useCommitStore } from "@/store/CommitStore";
import { DailyCommit } from "@/types/Commit.types";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import { ActivityIndicator, Alert, FlatList, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HistoryScreen() {
    const { user } = useAuthStore();
    const { commits, loading } = useCommitStore();
    const { fetchCommits, removeCommit } = useCommit();

    // Check if user is signed in with GitHub
    const isGitHubUser = user?.providerData?.some(
        (provider) => provider.providerId === 'github.com'
    );

    // Refetch commits when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            if (user) {
                console.log('Fetching commits in history for user:', user.uid);
                fetchCommits();
            }
        }, [user, fetchCommits])
    );

    const handleEdit = (commit: DailyCommit) => {
        router.push({
            pathname: "/add-commit" as any,
            params: { id: commit.id },
        });
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            "Delete Commit",
            "Are you sure you want to delete this commit? This action cannot be undone.",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const result = await removeCommit(id);
                        if (!result.success) {
                            Alert.alert("Error", result.message);
                        }
                    },
                },
            ]
        );
    };

    const renderHeader = () => (
        <View className="mb-4">
            <Header 
                title="History" 
                subtitle="Your journey of continuous improvement" 
            />
            {commits.length > 0 && (
                <View className="mt-4 bg-secondary/10 rounded-2xl p-4">
                    <View className="flex-row items-center justify-between">
                        <View>
                            <StyledText variant="medium" className="text-primary/70 text-sm">
                                Total Commits
                            </StyledText>
                            <StyledText variant="extrabold" className="text-secondary text-3xl">
                                {commits.length}
                            </StyledText>
                        </View>
                        <Ionicons name="calendar" size={40} color="#0891b2" />
                    </View>
                </View>
            )}
        </View>
    );

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
                <FlatList
                    data={commits}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <CommitCard
                            commit={item}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    )}
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={renderEmpty}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            </View>
        </SafeAreaView>
    );
}

import Header from "@/components/layout/Header";
import Alert from '@/components/ui/Alert';
import CommitCard from "@/components/ui/CommitCard";
import StyledText from "@/components/ui/StyledText";
import { useCallItADay } from "@/hooks/useCallItADay";
import { useCommit } from "@/hooks/useCommit";
import { useGithubCommits } from "@/hooks/useGithubCommits";
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useAuthStore } from "@/store/AuthStore";
import { useCommitStore } from "@/store/CommitStore";
import { DateRange } from "@/types/History.types";
import { Ionicons } from "@expo/vector-icons";
import { isAfter, parseISO, subDays, subMonths, subYears } from 'date-fns';
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HistoryScreen() {
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [selectedDateRange, setSelectedDateRange] = useState<DateRange>('all');
    const { colors } = useThemedStyles();

    const { user } = useAuthStore();
    const { commits, loading } = useCommitStore();
    const { fetchCommits } = useCommit();
    const { syncGithubCommits, loading: syncLoading } = useGithubCommits();
    const { callItADay, canCallItADay, resetCallItADay, loading: callItADayLoading } = useCallItADay();

    const [alertVisible, setAlertVisible] = useState<boolean>(false);
    const [confirmCallItADayVisible, setConfirmCallItADayVisible] = useState<boolean>(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        icon: 'checkmark-circle-outline' as keyof typeof Ionicons.glyphMap,
    });

    const isGitHubUser = user?.providerData?.some(
        (provider) => provider.providerId === 'github.com'
    );

    const filteredCommits = useMemo(() => {
        let filtered = [...commits];

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
    }, [commits, selectedDateRange]);

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

    const handleCallItADayPress = () => {
        // Show confirmation dialog
        setConfirmCallItADayVisible(true);
    };

    const handleConfirmCallItADay = async () => {
        setConfirmCallItADayVisible(false);
        
        // First sync GitHub commits
        if (isGitHubUser) {
            console.log('[Commits] Syncing GitHub commits before calling it a day...');
            const syncResult = await syncGithubCommits();
            console.log('[Commits] GitHub sync result:', syncResult);
            if (syncResult.success) {
                console.log('[Commits] GitHub sync successful, fetching commits...');
                await fetchCommits();
            }
        }

        // Then mark the day as complete
        console.log('[Commits] Calling it a day...');
        const result = await callItADay();
        console.log('[Commits] callItADay result:', result);

        setAlertConfig({
            title: result.success ? 'Day Complete! 🎉' : 'Oops!',
            message: result.message,
            icon: result.success ? 'moon' : 'alert-circle-outline',
        });
        setAlertVisible(true);
    };

    // FOR TESTING ONLY - Reset "Call it a Day" status
    const handleResetCallItADay = async () => {
        console.log('[Commits] Resetting Call it a Day status...');
        const result = await resetCallItADay();
        console.log('[Commits] Reset result:', result);
        
        setAlertConfig({
            title: result.success ? 'Reset Successful! 🔄' : 'Reset Failed',
            message: result.message,
            icon: result.success ? 'refresh-circle-outline' : 'alert-circle-outline',
        });
        setAlertVisible(true);
    };

    const renderEmpty = () => (
        <View style={styles.emptyState}>
            {isGitHubUser ? (
                <>
                    <Ionicons name="logo-github" size={60} color="#7C3AED" />
                    <StyledText variant="semibold" style={[styles.emptyTitle, { color: colors.text }]}>
                        No commits synced yet
                    </StyledText>
                    <StyledText variant="light" style={[styles.emptyMessage, { color: colors.textMuted }]}>
                        Go to Settings and sync your GitHub commits to start building your streak!
                    </StyledText>
                    <TouchableOpacity
                        onPress={() => router.push('/settings')}
                        style={styles.actionButton}
                    >
                        <StyledText variant="semibold" style={styles.actionButtonText}>
                            Go to Settings
                        </StyledText>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <StyledText style={styles.emptyEmoji}>🔗</StyledText>
                    <StyledText variant="semibold" style={[styles.emptyTitle, { color: colors.text }]}>
                        Connect GitHub First
                    </StyledText>
                    <StyledText variant="light" style={[styles.emptyMessage, { color: colors.textMuted }]}>
                        Sign in with GitHub to automatically track your coding activity!
                    </StyledText>
                    <TouchableOpacity
                        onPress={() => router.push('/settings')}
                        style={styles.actionButton}
                    >
                        <StyledText variant="semibold" style={styles.actionButtonText}>
                            Go to Settings
                        </StyledText>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );

    if (loading && commits.length === 0) {
        return (
            <SafeAreaView style={[styles.container, styles.centerContent, { backgroundColor: colors.neutral }]}>
                <ActivityIndicator size="large" color="#0891b2" />
                <StyledText variant="medium" style={[styles.loadingText, { color: colors.text }]}>
                    Loading your commits...
                </StyledText>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.neutral }]}>
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.headerRow}>
                    <View style={styles.headerContent}>
                        <Header 
                            title="Your Commits" 
                            subtitle="Your journey of continuous improvement" 
                        />
                    </View>
                </View>

                {/* "Day Complete" Banner - shown when user has called it a day */}
                {isGitHubUser && !canCallItADay() && (
                    <View style={[styles.dayCompleteBanner, { backgroundColor: colors.actionOpacity10, borderColor: colors.action }]}>
                        <Ionicons name="moon" size={24} color="#7C3AED" />
                        <View style={styles.bannerTextContainer}>
                            <StyledText variant="semibold" style={[styles.bannerTitle, { color: colors.action }]}>
                                Day Complete! 🌙
                            </StyledText>
                            <StyledText variant="medium" style={[styles.bannerSubtitle, { color: colors.textSecondary }]}>
                                Great work today! See you tomorrow for another productive day.
                            </StyledText>
                        </View>
                        {/* Hidden reset button for testing */}
                        <TouchableOpacity onPress={handleResetCallItADay} style={{ padding: 8 }}>
                            <Ionicons name="refresh-circle-outline" size={24} color="#7C3AED" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Filter Bar */}
                {/* <FilterBar
                    selectedDateRange={selectedDateRange}
                    onDateRangeChange={setSelectedDateRange}
                /> */}

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

                {/* Floating "Call it a Day" Button */}
                {isGitHubUser && canCallItADay() && (
                    <TouchableOpacity
                        onPress={handleCallItADayPress}
                        disabled={syncLoading || loading || callItADayLoading}
                        style={[
                            styles.floatingButton,
                            {
                                backgroundColor: (syncLoading || callItADayLoading) ? '#9ca3af' : '#7C3AED'
                            }
                        ]}
                    >
                        {(syncLoading || callItADayLoading) ? (
                            <ActivityIndicator size="small" color="#E6EEF2" />
                        ) : (
                            <>
                                <Ionicons name="moon" size={24} color="#E6EEF2" />
                                <StyledText style={styles.floatingButtonText} variant="semibold">
                                    Call it a Day
                                </StyledText>
                            </>
                        )}
                    </TouchableOpacity>
                )}

                {/* Confirmation Alert for "Call it a Day" */}
                <Alert
                    visible={confirmCallItADayVisible}
                    title="Ready to Call it a Day?"
                    message="This will sync your latest commits and mark today as complete. You won't be able to use this button again until tomorrow. Are you sure you're done for the day?"
                    icon="moon-outline"
                    iconColor="#7C3AED"
                    onClose={() => setConfirmCallItADayVisible(false)}
                    buttons={[
                        {
                            text: 'Not Yet',
                            style: 'cancel',
                            onPress: () => setConfirmCallItADayVisible(false),
                        },
                        {
                            text: "Yes, I'm Done!",
                            style: 'default',
                            onPress: handleConfirmCallItADay,
                        },
                    ]}
                />

                {/* Success/Error Alert */}
                <Alert
                    visible={alertVisible}
                    title={alertConfig.title}
                    message={alertConfig.message}
                    icon={alertConfig.icon}
                    onClose={() => setAlertVisible(false)}
                    buttons={[{ text: 'OK', style: 'default' }]}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    content: {
        flex: 1,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    headerContent: {
        flex: 1,
    },
    dayCompleteBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        gap: 12,
    },
    bannerTextContainer: {
        flex: 1,
    },
    bannerTitle: {
        fontSize: 16,
        marginBottom: 4,
    },
    bannerSubtitle: {
        fontSize: 14,
        lineHeight: 18,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 80,
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 24,
        marginBottom: 8,
        marginTop: 16,
    },
    emptyMessage: {
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 32,
        opacity: 0.6,
    },
    actionButton: {
        backgroundColor: '#7C3AED',
        borderRadius: 16,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 18,
    },
    floatingButton: {
        position: 'absolute',
        bottom: 24,
        right: -8,
        borderRadius: 9999,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    floatingButtonText: {
        marginLeft: 8,
        color: '#E6EEF2',
        fontSize: 16
    },
});

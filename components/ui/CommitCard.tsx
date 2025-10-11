import StyledText from "@/components/ui/StyledText";
import { DailyCommit } from "@/types/Commit.types";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Linking, TouchableOpacity, View } from "react-native";

interface CommitCardProps {
    commit: DailyCommit;
}

export default function CommitCard({ commit }: CommitCardProps) {
    const [expanded, setExpanded] = useState<boolean>(false);

    const isGitHubSync = commit.tag === 'github-sync';
    const hasGitHubCommits = commit.githubCommits && commit.githubCommits.length > 0;
    const isManualCommit = commit.title || commit.timeSpent || commit.difficulty || commit.description || (commit.tags && commit.tags.length > 0);

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatTimeSpent = (minutes: number) => {
        if (minutes < 60) {
            return `${minutes}m`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy':
                return 'bg-green-500';
            case 'medium':
                return 'bg-yellow-500';
            case 'hard':
                return 'bg-red-500';
            default:
                return 'bg-gray-300';
        }
    };

    const getDifficultyIcon = (difficulty: string) => {
        switch (difficulty) {
            case 'easy':
                return '😊';
            case 'medium':
                return '😐';
            case 'hard':
                return '😰';
            default:
                return '';
        }
    };

    const openGitHubUrl = (url: string) => {
        Linking.openURL(url);
    };

    return (
        <View className="bg-white rounded-2xl p-4 mb-3 shadow-md">
            {/* Header with date and actions */}
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                        <StyledText variant="semibold" className="text-primary text-lg">
                            {formatDate(commit.createdAt)}
                        </StyledText>
                        {isGitHubSync && (
                            <View className="bg-action/10 px-2 py-1 rounded-md flex-row items-center gap-1">
                                <Ionicons name="logo-github" size={12} color="#7C3AED" />
                            </View>
                        )}
                        {isManualCommit && !isGitHubSync && (
                            <View className="bg-secondary/10 px-2 py-1 rounded-md flex-row items-center gap-1">
                                <Ionicons name="create" size={12} color="#0EA5A4" />
                                <StyledText variant="medium" className="text-secondary text-xs">
                                    Manual
                                </StyledText>
                            </View>
                        )}
                    </View>
                    <StyledText variant="light" className="text-primary/60 text-sm">
                        {formatTime(commit.createdAt)}
                    </StyledText>
                </View>
            </View>

            {/* Manual Commit Details */}
            {isManualCommit && (
                <View className="mb-3 bg-neutral/50 p-4 rounded-xl">
                    {/* Title */}
                    {commit.title && (
                        <StyledText variant="semibold" className="text-primary text-xl mb-2">
                            {commit.title}
                        </StyledText>
                    )}

                    {/* Time Spent & Difficulty */}
                    <View className="flex-row items-center gap-3 mb-3">
                        {commit.timeSpent && (
                            <View className="flex-row items-center gap-1 bg-action/10 px-3 py-1.5 rounded-full">
                                <Ionicons name="time" size={14} color="#7C3AED" />
                                <StyledText variant="medium" className="text-action text-sm">
                                    {formatTimeSpent(commit.timeSpent)}
                                </StyledText>
                            </View>
                        )}
                        {commit.difficulty && (
                            <View className={`flex-row items-center gap-1 px-3 py-1.5 rounded-full ${getDifficultyColor(commit.difficulty)}/10`}>
                                <StyledText className="text-base">
                                    {getDifficultyIcon(commit.difficulty)}
                                </StyledText>
                                <StyledText variant="medium" className="text-sm capitalize" style={{ color: commit.difficulty === 'easy' ? '#22c55e' : commit.difficulty === 'medium' ? '#eab308' : '#ef4444' }}>
                                    {commit.difficulty}
                                </StyledText>
                            </View>
                        )}
                    </View>

                    {/* Description */}
                    {commit.description && (
                        <StyledText variant="regular" className="text-primary/80 text-base mb-3 leading-6">
                            {commit.description}
                        </StyledText>
                    )}

                    {/* Tags */}
                    {commit.tags && commit.tags.length > 0 && (
                        <View className="flex-row flex-wrap gap-2">
                            {commit.tags.map((tag, index) => (
                                <View
                                    key={index}
                                    className="bg-action/10 px-2.5 py-1 rounded-full"
                                >
                                    <StyledText variant="medium" className="text-action text-xs">
                                        #{tag}
                                    </StyledText>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            )}

            {/* GitHub Commits Details */}
            {hasGitHubCommits && (
                <View className="mb-3">
                    <TouchableOpacity 
                        onPress={() => setExpanded(!expanded)}
                        className="flex-row items-center justify-between bg-neutral/50 p-3 rounded-xl mb-2"
                    >
                        <View className="flex-row items-center gap-2">
                            <Ionicons name="git-commit" size={20} color="#7C3AED" />
                            <StyledText variant="semibold" className="text-primary">
                                {commit.githubCommits!.length} GitHub {commit.githubCommits!.length === 1 ? 'Commit' : 'Commits'}
                            </StyledText>
                        </View>
                        <Ionicons 
                            name={expanded ? "chevron-up" : "chevron-down"} 
                            size={20} 
                            color="#7C3AED" 
                        />
                    </TouchableOpacity>

                    {expanded && (
                        <View className="space-y-2">
                            {commit.githubCommits!.map((ghCommit) => (
                                <View 
                                    key={ghCommit.sha} 
                                    className="bg-neutral/30 p-3 rounded-lg border-l-4 border-action"
                                >
                                    {/* Repository Name */}
                                    <View className="flex-row items-center gap-2 mb-2">
                                        <Ionicons name="folder" size={14} color="#7C3AED" />
                                        <StyledText variant="semibold" className="text-primary text-sm">
                                            {ghCommit.repo}
                                        </StyledText>
                                    </View>

                                    {/* Commit Message */}
                                    <StyledText variant="regular" className="text-primary/90 text-sm mb-2">
                                        {ghCommit.message.split('\n')[0]}
                                    </StyledText>

                                    {/* SHA and Date */}
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-row items-center gap-2">
                                            <View className="bg-primary/10 px-2 py-1 rounded">
                                                <StyledText variant="medium" className="text-primary/70 text-xs">
                                                    {ghCommit.sha.substring(0, 7)}
                                                </StyledText>
                                            </View>
                                            <StyledText variant="light" className="text-primary/60 text-xs">
                                                {new Date(ghCommit.date).toLocaleString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </StyledText>
                                        </View>
                                        
                                        {/* View on GitHub Button */}
                                        <TouchableOpacity
                                            onPress={() => openGitHubUrl(ghCommit.url)}
                                            className="flex-row items-center gap-1 bg-action/10 px-2 py-1 rounded"
                                        >
                                            <Ionicons name="open-outline" size={12} color="#7C3AED" />
                                            <StyledText variant="medium" className="text-action text-xs">
                                                View
                                            </StyledText>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}

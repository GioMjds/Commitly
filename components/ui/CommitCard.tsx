import StyledText from "@/components/ui/StyledText";
import { DailyCommit } from "@/types/Commit.types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";

interface CommitCardProps {
    commit: DailyCommit;
    onEdit: (commit: DailyCommit) => void;
    onDelete: (id: string) => void;
}

export default function CommitCard({ commit, onEdit, onDelete }: CommitCardProps) {
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

    return (
        <View className="bg-white rounded-2xl p-4 mb-3 shadow-md">
            {/* Header with date and actions */}
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                    <StyledText variant="semibold" className="text-primary text-lg">
                        {formatDate(commit.createdAt)}
                    </StyledText>
                    <StyledText variant="light" className="text-primary/60 text-sm">
                        {formatTime(commit.createdAt)}
                    </StyledText>
                </View>

                {/* Action buttons */}
                <View className="flex-row gap-2">
                    <TouchableOpacity
                        onPress={() => onEdit(commit)}
                        className="bg-secondary/10 p-2 rounded-lg"
                    >
                        <Ionicons name="pencil" size={18} color="#0891b2" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => onDelete(commit.id)}
                        className="bg-red-500/10 p-2 rounded-lg"
                    >
                        <Ionicons name="trash" size={18} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Note content */}
            <StyledText variant="regular" className="text-primary/90 text-base mb-3">
                {commit.note}
            </StyledText>

            {/* Bottom row with tag and mood */}
            <View className="flex-row justify-between items-center">
                {commit.tag ? (
                    <View className="bg-action/10 px-3 py-1 rounded-full">
                        <StyledText variant="medium" className="text-action text-sm">
                            #{commit.tag}
                        </StyledText>
                    </View>
                ) : (
                    <View />
                )}

                {commit.mood && (
                    <StyledText className="text-2xl">{commit.mood}</StyledText>
                )}
            </View>
        </View>
    );
}

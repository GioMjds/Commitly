import MoodPicker from "@/components/ui/MoodPicker";
import StyledText from "@/components/ui/StyledText";
import { useCommit } from "@/hooks/useCommit";
import { useCommitStore } from "@/store/CommitStore";
import { CommitFormData, MoodType } from "@/types/Commit.types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddCommitScreen() {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const { commits, loading } = useCommitStore();
    const { createCommit, editCommit } = useCommit();

    const [note, setNote] = useState("");
    const [tag, setTag] = useState("");
    const [selectedMood, setSelectedMood] = useState<MoodType | undefined>();

    const isEditing = !!id;
    const editingCommit = isEditing
        ? commits.find((c) => c.id === id)
        : undefined;

    useEffect(() => {
        if (editingCommit) {
            setNote(editingCommit.note);
            setTag(editingCommit.tag || "");
            setSelectedMood(editingCommit.mood);
        }
    }, [editingCommit]);

    const handleSubmit = async () => {
        if (!note.trim()) {
            Alert.alert("Error", "Please enter a note for your commit");
            return;
        }

        const data: CommitFormData = {
            note: note.trim(),
            tag: tag.trim() || undefined,
            mood: selectedMood,
        };

        const result = isEditing
            ? await editCommit(id!, data)
            : await createCommit(data);

        if (result.success) {
            Alert.alert("Success", result.message);
            router.back();
        } else {
            Alert.alert("Error", result.message);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-neutral">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1 px-4 py-6"
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View className="flex-row items-center mb-6">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="mr-4 bg-white p-2 rounded-xl"
                        >
                            <Ionicons name="arrow-back" size={24} color="#222831" />
                        </TouchableOpacity>
                        <View className="flex-1">
                            <StyledText variant="black" className="text-primary text-3xl">
                                {isEditing ? "Edit Commit" : "New Commit"}
                            </StyledText>
                            <StyledText variant="light" className="text-primary/70">
                                {new Date().toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </StyledText>
                        </View>
                    </View>

                    {/* Note Input */}
                    <View className="mb-6">
                        <StyledText variant="medium" className="text-primary mb-2 text-lg">
                            What did you accomplish today?
                        </StyledText>
                        <TextInput
                            className="bg-white rounded-2xl p-4 text-primary border border-gray-200"
                            placeholder="Share your progress, learnings, or achievements..."
                            placeholderTextColor="#94a3b8"
                            value={note}
                            onChangeText={setNote}
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                            style={{ minHeight: 150, fontFamily: "HubotSans-Regular" }}
                        />
                    </View>

                    {/* Tag Input */}
                    <View className="mb-6">
                        <StyledText variant="medium" className="text-primary mb-2 text-lg">
                            Add a tag (optional)
                        </StyledText>
                        <View className="flex-row items-center bg-white rounded-2xl px-4 py-4 border border-gray-200">
                            <StyledText className="text-action text-xl mr-2">#</StyledText>
                            <TextInput
                                className="flex-1 text-primary"
                                placeholder="e.g. frontend, learning, debugging"
                                placeholderTextColor="#94a3b8"
                                value={tag}
                                onChangeText={setTag}
                                style={{ fontFamily: "HubotSans-Regular" }}
                            />
                        </View>
                        <StyledText variant="light" className="text-primary/50 text-sm mt-2">
                            Tags help you categorize and track your progress
                        </StyledText>
                    </View>

                    {/* Mood Picker */}
                    <View className="mb-8">
                        <MoodPicker
                            selectedMood={selectedMood}
                            onSelectMood={setSelectedMood}
                        />
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={loading}
                        className="bg-action rounded-2xl py-4 items-center shadow-lg mb-6"
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <StyledText variant="semibold" className="text-white text-xl">
                                {isEditing ? "Update Commit" : "Save Commit"}
                            </StyledText>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

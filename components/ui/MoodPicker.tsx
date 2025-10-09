import StyledText from "@/components/ui/StyledText";
import { MoodType } from "@/types/Commit.types";
import React from "react";
import { TouchableOpacity, View } from "react-native";

interface MoodPickerProps {
    selectedMood?: MoodType;
    onSelectMood: (mood: MoodType) => void;
}

const MOODS: MoodType[] = ["😄", "😊", "😐", "😔", "😞"];

const MOOD_LABELS: Record<MoodType, string> = {
    "😄": "Excited",
    "😊": "Happy",
    "😐": "Neutral",
    "😔": "Tired",
    "😞": "Sad",
};

export default function MoodPicker({ selectedMood, onSelectMood }: MoodPickerProps) {
    return (
        <View>
            <StyledText variant="medium" className="text-primary mb-3">
                How are you feeling today?
            </StyledText>
            <View className="flex-row justify-between">
                {MOODS.map((mood) => (
                    <TouchableOpacity
                        key={mood}
                        onPress={() => onSelectMood(mood)}
                        className={`items-center p-3 rounded-2xl ${
                            selectedMood === mood
                                ? "bg-action/20 border-2 border-action"
                                : "bg-gray-100"
                        }`}
                        style={{ width: "18%" }}
                    >
                        <StyledText className="text-3xl mb-1">{mood}</StyledText>
                        <StyledText
                            variant="light"
                            className={`text-xs ${
                                selectedMood === mood ? "text-action" : "text-primary/60"
                            }`}
                        >
                            {MOOD_LABELS[mood]}
                        </StyledText>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

import Alert from "@/components/ui/Alert";
import StyledText from "@/components/ui/StyledText";
import { useCommit } from "@/hooks/useCommit";
import { CommitFormData } from "@/types/Commit.types";
import { CommitFormSchema, commitSchema } from "@/utils/validations";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type DifficultyLevel = 'easy' | 'medium' | 'hard';
type TimeUnit = 'minutes' | 'hours' | 'days';

export default function AddCommitScreen() {
    const [alertVisible, setAlertVisible] = useState<boolean>(false);
    const [alertTitle, setAlertTitle] = useState<string>("");
    const [alertMessage, setAlertMessage] = useState<string>("");
    const [alertIcon, setAlertIcon] = useState<keyof typeof Ionicons.glyphMap>("checkmark-circle");
    const [loading, setLoading] = useState<boolean>(false);

    const { createCommit } = useCommit();

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<CommitFormSchema>({
        mode: "onBlur",
        resolver: zodResolver(commitSchema),
        defaultValues: {
            title: "",
            timeSpent: undefined,
            timeUnit: 'minutes',
            difficulty: undefined,
            description: "",
        },
    });

    const difficulty = watch("difficulty");

    const handleDifficultySelect = (level: DifficultyLevel) => {
        setValue("difficulty", level);
    };

    const handleTimeUnitSelect = (unit: TimeUnit) => {
        setValue("timeUnit", unit);
    };

    const onSubmit = async (data: CommitFormSchema) => {
        setLoading(true);
        
        const commitData: CommitFormData = {
            note: data.title,
            title: data.title,
            timeSpent: data.timeSpent,
            timeUnit: data.timeUnit,
            difficulty: data.difficulty,
            description: data.description,
        };

        const result = await createCommit(commitData);

        if (result.success) {
            setAlertTitle("Success!");
            setAlertMessage("Your commit has been added successfully 🎉");
            setAlertIcon("checkmark-circle");
            setAlertVisible(true);

            reset();

            setTimeout(() => {
                router.back();
            }, 1500);
        } else {
            setAlertTitle("Error");
            setAlertMessage(result.message || "Failed to add commit");
            setAlertIcon("close-circle");
            setAlertVisible(true);
        }
        setLoading(false);
    };

    const getDifficultyIcon = (level: DifficultyLevel) => {
        switch (level) {
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

    return (
        <SafeAreaView className="flex-1 bg-neutral">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                {/* Header */}
                <View className="px-6 py-4 border-b border-gray-200">
                    <View className="flex-row items-center justify-between">
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="close" size={28} color="#0F172A" />
                        </TouchableOpacity>
                        <StyledText variant="semibold" className="text-primary text-2xl">
                            Add Commit Note
                        </StyledText>
                        <TouchableOpacity
                            onPress={handleSubmit(onSubmit)}
                            disabled={loading}
                            className="bg-action rounded-xl px-4 py-2"
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <StyledText variant="semibold" className="text-white">
                                    Save
                                </StyledText>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView
                    className="flex-1 px-6 py-4"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Title Input */}
                    <View className="mb-4">
                        <StyledText variant="semibold" className="text-primary text-lg mb-2">
                            Title *
                        </StyledText>
                        <Controller
                            control={control}
                            name="title"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    placeholder="What did you work on?"
                                    placeholderTextColor="#94a3b8"
                                    className="bg-white rounded-2xl px-4 py-4 text-primary font-hubot text-base border border-gray-200"
                                />
                            )}
                        />
                        {errors.title && (
                            <StyledText variant="medium" className="text-red-500 text-sm mt-1">
                                {errors.title.message}
                            </StyledText>
                        )}
                    </View>

                    {/* Time Spent Input */}
                    <View className="mb-4">
                        <StyledText variant="semibold" className="text-primary text-lg mb-2">
                            Time Spent
                        </StyledText>
                        
                        {/* Time Input */}
                        <Controller
                            control={control}
                            name="timeSpent"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    value={value?.toString() || ""}
                                    onChangeText={(text) => {
                                        const num = parseInt(text);
                                        onChange(isNaN(num) ? undefined : num);
                                    }}
                                    onBlur={onBlur}
                                    placeholder="e.g., 30"
                                    placeholderTextColor="#94a3b8"
                                    keyboardType="numeric"
                                    className="bg-white rounded-2xl px-4 py-4 text-primary font-hubot text-base border border-gray-200 mb-3"
                                />
                            )}
                        />
                        
                        {/* Time Unit Selector */}
                        <Controller
                            control={control}
                            name="timeUnit"
                            render={({ field: { value } }) => (
                                <View>
                                    <View style={{ flexDirection: 'row', gap: 8 }}>
                                        <TouchableOpacity
                                            onPress={() => handleTimeUnitSelect('minutes')}
                                            style={{
                                                flex: 1,
                                                paddingVertical: 12,
                                                paddingHorizontal: 16,
                                                backgroundColor: value === 'minutes' ? '#7C3AED' : '#FFFFFF',
                                                borderRadius: 16,
                                                borderWidth: 2,
                                                borderColor: value === 'minutes' ? '#7C3AED' : '#E5E7EB',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <StyledText
                                                variant={value === 'minutes' ? 'semibold' : 'medium'}
                                                style={{ color: value === 'minutes' ? '#FFFFFF' : '#64748B' }}
                                            >
                                                Minutes
                                            </StyledText>
                                        </TouchableOpacity>
                                        
                                        <TouchableOpacity
                                            onPress={() => handleTimeUnitSelect('hours')}
                                            style={{
                                                flex: 1,
                                                paddingVertical: 12,
                                                paddingHorizontal: 16,
                                                backgroundColor: value === 'hours' ? '#7C3AED' : '#FFFFFF',
                                                borderRadius: 16,
                                                borderWidth: 2,
                                                borderColor: value === 'hours' ? '#7C3AED' : '#E5E7EB',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <StyledText
                                                variant={value === 'hours' ? 'semibold' : 'medium'}
                                                style={{ color: value === 'hours' ? '#FFFFFF' : '#64748B' }}
                                            >
                                                Hours
                                            </StyledText>
                                        </TouchableOpacity>
                                        
                                        <TouchableOpacity
                                            onPress={() => handleTimeUnitSelect('days')}
                                            style={{
                                                flex: 1,
                                                paddingVertical: 12,
                                                paddingHorizontal: 16,
                                                backgroundColor: value === 'days' ? '#7C3AED' : '#FFFFFF',
                                                borderRadius: 16,
                                                borderWidth: 2,
                                                borderColor: value === 'days' ? '#7C3AED' : '#E5E7EB',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <StyledText
                                                variant={value === 'days' ? 'semibold' : 'medium'}
                                                style={{ color: value === 'days' ? '#FFFFFF' : '#64748B' }}
                                            >
                                                Days
                                            </StyledText>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        />
                        
                        {errors.timeSpent && (
                            <StyledText variant="medium" className="text-red-500 text-sm mt-1">
                                {errors.timeSpent.message}
                            </StyledText>
                        )}
                    </View>

                    {/* Difficulty Selector */}
                    <View className="mb-4">
                        <StyledText variant="semibold" className="text-primary text-lg mb-2">
                            Difficulty
                        </StyledText>
                        <View className="flex-row gap-3">
                            {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((level) => (
                                <TouchableOpacity
                                    key={level}
                                    onPress={() => handleDifficultySelect(level)}
                                    className={`flex-1 rounded-2xl py-4 items-center justify-center border-2 ${
                                        difficulty === level
                                            ? 'border-action bg-action/10'
                                            : 'border-gray-200 bg-white'
                                    }`}
                                >
                                    <StyledText className="text-3xl mb-1">
                                        {getDifficultyIcon(level)}
                                    </StyledText>
                                    <StyledText
                                        variant={difficulty === level ? 'semibold' : 'medium'}
                                        className={`capitalize ${
                                            difficulty === level
                                                ? 'text-action'
                                                : 'text-primary/60'
                                        }`}
                                    >
                                        {level}
                                    </StyledText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Description Input */}
                    <View className="mb-4">
                        <StyledText variant="semibold" className="text-primary text-lg mb-2">
                            Description *
                        </StyledText>
                        <Controller
                            control={control}
                            name="description"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    placeholder="Describe what you accomplished, challenges faced, or lessons learned..."
                                    placeholderTextColor="#94a3b8"
                                    multiline
                                    numberOfLines={6}
                                    textAlignVertical="top"
                                    className="bg-white rounded-2xl px-4 py-4 text-primary font-hubot text-base border border-gray-200 min-h-[150px]"
                                />
                            )}
                        />
                        {errors.description && (
                            <StyledText variant="medium" className="text-red-500 text-sm mt-1">
                                {errors.description.message}
                            </StyledText>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <Alert
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                icon={alertIcon}
                onClose={() => setAlertVisible(false)}
            />
        </SafeAreaView>
    );
}
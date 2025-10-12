import Alert from "@/components/ui/Alert";
import StyledText from "@/components/ui/StyledText";
import { useCommit } from "@/hooks/useCommit";
import { useThemedStyles } from "@/hooks/useThemedStyles";
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
    StyleSheet,
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
    const { colors } = useThemedStyles();

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
        <SafeAreaView style={[styles.container, { backgroundColor: colors.neutral }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="close" size={28} color={colors.text} />
                        </TouchableOpacity>
                        <StyledText variant="semibold" style={[styles.headerTitle, { color: colors.text }]}>
                            Add Commit Note
                        </StyledText>
                        <TouchableOpacity
                            onPress={handleSubmit(onSubmit)}
                            disabled={loading}
                            style={styles.saveButton}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <StyledText variant="semibold" style={styles.saveButtonText}>
                                    Save
                                </StyledText>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Title Input */}
                    <View style={styles.fieldContainer}>
                        <StyledText variant="semibold" style={[styles.fieldLabel, { color: colors.text }]}>
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
                                    placeholderTextColor={colors.textMuted}
                                    style={[
                                        styles.textInput,
                                        {
                                            backgroundColor: colors.surface,
                                            color: colors.text,
                                            borderColor: colors.border,
                                        }
                                    ]}
                                />
                            )}
                        />
                        {errors.title && (
                            <StyledText variant="medium" style={styles.errorText}>
                                {errors.title.message}
                            </StyledText>
                        )}
                    </View>

                    {/* Time Spent Input */}
                    <View style={styles.fieldContainer}>
                        <StyledText variant="semibold" style={[styles.fieldLabel, { color: colors.text }]}>
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
                                    placeholderTextColor={colors.textMuted}
                                    keyboardType="numeric"
                                    style={[
                                        styles.textInput,
                                        styles.timeInput,
                                        {
                                            backgroundColor: colors.surface,
                                            color: colors.text,
                                            borderColor: colors.border,
                                        }
                                    ]}
                                />
                            )}
                        />
                        
                        {/* Time Unit Selector */}
                        <Controller
                            control={control}
                            name="timeUnit"
                            render={({ field: { value } }) => (
                                <View>
                                    <View style={styles.timeUnitRow}>
                                        <TouchableOpacity
                                            onPress={() => handleTimeUnitSelect('minutes')}
                                            style={[
                                                styles.timeUnitButton,
                                                {
                                                    backgroundColor: value === 'minutes' ? '#7C3AED' : colors.surface,
                                                    borderColor: value === 'minutes' ? '#7C3AED' : colors.borderLight,
                                                }
                                            ]}
                                        >
                                            <StyledText
                                                variant={value === 'minutes' ? 'semibold' : 'medium'}
                                                style={{ color: value === 'minutes' ? '#FFFFFF' : colors.textMuted }}
                                            >
                                                Minutes
                                            </StyledText>
                                        </TouchableOpacity>
                                        
                                        <TouchableOpacity
                                            onPress={() => handleTimeUnitSelect('hours')}
                                            style={[
                                                styles.timeUnitButton,
                                                {
                                                    backgroundColor: value === 'hours' ? '#7C3AED' : colors.surface,
                                                    borderColor: value === 'hours' ? '#7C3AED' : colors.borderLight,
                                                }
                                            ]}
                                        >
                                            <StyledText
                                                variant={value === 'hours' ? 'semibold' : 'medium'}
                                                style={{ color: value === 'hours' ? '#FFFFFF' : colors.textMuted }}
                                            >
                                                Hours
                                            </StyledText>
                                        </TouchableOpacity>
                                        
                                        <TouchableOpacity
                                            onPress={() => handleTimeUnitSelect('days')}
                                            style={[
                                                styles.timeUnitButton,
                                                {
                                                    backgroundColor: value === 'days' ? '#7C3AED' : colors.surface,
                                                    borderColor: value === 'days' ? '#7C3AED' : colors.borderLight,
                                                }
                                            ]}
                                        >
                                            <StyledText
                                                variant={value === 'days' ? 'semibold' : 'medium'}
                                                style={{ color: value === 'days' ? '#FFFFFF' : colors.textMuted }}
                                            >
                                                Days
                                            </StyledText>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        />
                        
                        {errors.timeSpent && (
                            <StyledText variant="medium" style={styles.errorText}>
                                {errors.timeSpent.message}
                            </StyledText>
                        )}
                    </View>

                    {/* Difficulty Selector */}
                    <View style={styles.fieldContainer}>
                        <StyledText variant="semibold" style={[styles.fieldLabel, { color: colors.text }]}>
                            Difficulty
                        </StyledText>
                        <View style={styles.difficultyRow}>
                            {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((level) => (
                                <TouchableOpacity
                                    key={level}
                                    onPress={() => handleDifficultySelect(level)}
                                    style={[
                                        styles.difficultyButton,
                                        {
                                            backgroundColor: difficulty === level ? colors.actionOpacity10 : colors.surface,
                                            borderColor: difficulty === level ? colors.action : colors.border,
                                        }
                                    ]}
                                >
                                    <StyledText style={styles.difficultyEmoji}>
                                        {getDifficultyIcon(level)}
                                    </StyledText>
                                    <StyledText
                                        variant={difficulty === level ? 'semibold' : 'medium'}
                                        style={[
                                            styles.difficultyText,
                                            {
                                                color: difficulty === level ? colors.action : colors.textSecondary,
                                            }
                                        ]}
                                    >
                                        {level}
                                    </StyledText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Description Input */}
                    <View style={styles.fieldContainer}>
                        <StyledText variant="semibold" style={[styles.fieldLabel, { color: colors.text }]}>
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
                                    placeholderTextColor={colors.textMuted}
                                    multiline
                                    numberOfLines={6}
                                    textAlignVertical="top"
                                    style={[
                                        styles.textInput,
                                        styles.descriptionInput,
                                        {
                                            backgroundColor: colors.surface,
                                            color: colors.text,
                                            borderColor: colors.border,
                                        }
                                    ]}
                                />
                            )}
                        />
                        {errors.description && (
                            <StyledText variant="medium" style={styles.errorText}>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 24,
    },
    saveButton: {
        backgroundColor: '#7C3AED',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    saveButtonText: {
        color: '#FFFFFF',
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    fieldContainer: {
        marginBottom: 16,
    },
    fieldLabel: {
        fontSize: 18,
        marginBottom: 8,
    },
    textInput: {
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        fontFamily: 'HubotSans-Regular',
        borderWidth: 1,
    },
    timeInput: {
        marginBottom: 12,
    },
    descriptionInput: {
        minHeight: 150,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 14,
        marginTop: 4,
    },
    timeUnitRow: {
        flexDirection: 'row',
        gap: 8,
    },
    timeUnitButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 2,
        alignItems: 'center',
    },
    difficultyRow: {
        flexDirection: 'row',
        gap: 12,
    },
    difficultyButton: {
        flex: 1,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
    },
    difficultyEmoji: {
        fontSize: 32,
        marginBottom: 4,
    },
    difficultyText: {
        textTransform: 'capitalize',
    },
});
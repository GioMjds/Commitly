import StyledText from '@/components/ui/StyledText';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';

interface FilterBarProps {
    tags: string[];
    repos: string[];
    selectedTag: string | null;
    selectedRepo: string | null;
    selectedDateRange: 'all' | 'week' | 'month' | 'year';
    onTagChange: (tag: string | null) => void;
    onRepoChange: (repo: string | null) => void;
    onDateRangeChange: (range: 'all' | 'week' | 'month' | 'year') => void;
}

export default function FilterBar({
    tags,
    repos,
    selectedTag,
    selectedRepo,
    selectedDateRange,
    onTagChange,
    onRepoChange,
    onDateRangeChange,
}: FilterBarProps) {
    const [showFilters, setShowFilters] = useState(false);

    return (
        <View className="mb-4">
            {/* Filter Toggle Button */}
            <TouchableOpacity
                onPress={() => setShowFilters(!showFilters)}
                className="bg-white rounded-xl p-3 flex-row items-center justify-between shadow-sm mb-2"
            >
                <View className="flex-row items-center">
                    <Ionicons name="filter" size={20} color="#7C3AED" />
                    <StyledText variant="semibold" className="text-primary ml-2">
                        Filters
                    </StyledText>
                    {(selectedTag || selectedRepo || selectedDateRange !== 'all') && (
                        <View className="ml-2 bg-action rounded-full w-2 h-2" />
                    )}
                </View>
                <Ionicons 
                    name={showFilters ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#0F172A" 
                />
            </TouchableOpacity>

            {/* Filter Options */}
            {showFilters && (
                <View className="bg-white rounded-xl p-4 shadow-sm">
                    {/* Date Range Filter */}
                    <View className="mb-4">
                        <StyledText variant="semibold" className="text-primary mb-2">
                            Date Range
                        </StyledText>
                        <View className="flex-row flex-wrap gap-2">
                            {(['all', 'week', 'month', 'year'] as const).map((range) => (
                                <TouchableOpacity
                                    key={range}
                                    onPress={() => onDateRangeChange(range)}
                                    className={`px-4 py-2 rounded-xl ${
                                        selectedDateRange === range
                                            ? 'bg-action'
                                            : 'bg-neutral'
                                    }`}
                                >
                                    <StyledText
                                        variant="medium"
                                        className={
                                            selectedDateRange === range
                                                ? 'text-white'
                                                : 'text-primary'
                                        }
                                    >
                                        {range.charAt(0).toUpperCase() + range.slice(1)}
                                    </StyledText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Repo Filter */}
                    {repos.length > 0 && (
                        <View>
                            <StyledText variant="semibold" className="text-primary mb-2">
                                Repositories
                            </StyledText>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View className="flex-row gap-2">
                                    <TouchableOpacity
                                        onPress={() => onRepoChange(null)}
                                        className={`px-4 py-2 rounded-xl ${
                                            !selectedRepo ? 'bg-action' : 'bg-neutral'
                                        }`}
                                    >
                                        <StyledText
                                            variant="medium"
                                            className={
                                                !selectedRepo ? 'text-white' : 'text-primary'
                                            }
                                        >
                                            All
                                        </StyledText>
                                    </TouchableOpacity>
                                    {repos.map((repo) => (
                                        <TouchableOpacity
                                            key={repo}
                                            onPress={() => onRepoChange(repo)}
                                            className={`px-4 py-2 rounded-xl ${
                                                selectedRepo === repo ? 'bg-action' : 'bg-neutral'
                                            }`}
                                        >
                                            <StyledText
                                                variant="medium"
                                                className={
                                                    selectedRepo === repo
                                                        ? 'text-white'
                                                        : 'text-primary'
                                                }
                                            >
                                                {repo.split('/').pop()}
                                            </StyledText>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    )}

                    {/* Clear Filters */}
                    {(selectedTag || selectedRepo || selectedDateRange !== 'all') && (
                        <TouchableOpacity
                            onPress={() => {
                                onTagChange(null);
                                onRepoChange(null);
                                onDateRangeChange('all');
                            }}
                            className="mt-4 bg-red-100 rounded-xl p-3 flex-row items-center justify-center"
                        >
                            <Ionicons name="close-circle" size={20} color="#DC2626" />
                            <StyledText variant="semibold" className="text-red-600 ml-2">
                                Clear All Filters
                            </StyledText>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
}

export type MoodType = '😄' | '😐' | '😞' | '😊' | '😔';

export interface DailyCommit {
    id: string;
    userId: string;
    note: string;
    tag?: string;
    mood?: MoodType;
    createdAt: Date;
    updatedAt: Date;
    date: string; // YYYY-MM-DD format for easy querying
}

export interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastCommitDate: string | null;
}

export interface DashboardStats {
    totalCommits: number;
    currentStreak: number;
    longestStreak: number;
    topTags: { tag: string; count: number }[];
    moodTrend: { mood: MoodType; count: number }[];
}

export interface CommitFormData {
    note: string;
    tag?: string;
    mood?: MoodType;
}

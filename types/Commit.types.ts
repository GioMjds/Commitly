type TimeUnit = 'minutes' | 'hours' | 'days';
type Difficulty = 'easy' | 'medium' | 'hard'; 

export interface GitHubCommitDetail {
    sha: string;
    message: string;
    repo: string;
    url: string;
    date: string;
}

export interface DailyCommit {
    id: string;
    userId: string;
    note: string;
    tag?: string;
    createdAt: Date;
    updatedAt: Date;
    date: string;
    githubCommits?: GitHubCommitDetail[];
    title?: string;
    timeSpent?: number;
    timeUnit?: TimeUnit;
    difficulty?: Difficulty;
    description?: string;
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
}

export interface CommitFormData {
    note: string;
    title?: string;
    timeSpent?: number;
    timeUnit?: TimeUnit;
    difficulty?: Difficulty;
    description?: string;
}

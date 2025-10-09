import { DailyCommit, StreakData } from "@/types/Commit.types";
import { create } from "zustand";

interface CommitState {
    commits: DailyCommit[];
    streakData: StreakData;
    loading: boolean;
    setCommits: (commits: DailyCommit[]) => void;
    addCommit: (commit: DailyCommit) => void;
    updateCommit: (id: string, commit: Partial<DailyCommit>) => void;
    deleteCommit: (id: string) => void;
    setStreakData: (streakData: StreakData) => void;
    setLoading: (loading: boolean) => void;
}

export const useCommitStore = create<CommitState>((set) => ({
    commits: [],
    streakData: {
        currentStreak: 0,
        longestStreak: 0,
        lastCommitDate: null,
    },
    loading: false,
    setCommits: (commits) => set({ commits }),
    addCommit: (commit) => set((state) => ({ 
        commits: [commit, ...state.commits] 
    })),
    updateCommit: (id, updatedCommit) => set((state) => ({
        commits: state.commits.map((commit) =>
            commit.id === id ? { ...commit, ...updatedCommit } : commit
        ),
    })),
    deleteCommit: (id) => set((state) => ({
        commits: state.commits.filter((commit) => commit.id !== id),
    })),
    setStreakData: (streakData) => set({ streakData }),
    setLoading: (loading) => set({ loading }),
}));

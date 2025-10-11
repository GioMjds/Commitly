import { DailyCommit, StreakData } from "@/types/Commit.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

interface PendingCommit {
    id: string;
    data: any;
    operation: 'create' | 'update' | 'delete';
    timestamp: number;
}

interface CommitState {
    commits: DailyCommit[];
    streakData: StreakData;
    loading: boolean;
    pendingOperations: PendingCommit[];
    setCommits: (commits: DailyCommit[]) => void;
    addCommit: (commit: DailyCommit) => void;
    updateCommit: (id: string, commit: Partial<DailyCommit>) => void;
    deleteCommit: (id: string) => void;
    setStreakData: (streakData: StreakData) => void;
    setLoading: (loading: boolean) => void;
    addPendingOperation: (operation: PendingCommit) => void;
    removePendingOperation: (id: string) => void;
    loadPendingOperations: () => Promise<void>;
}

export const useCommitStore = create<CommitState>((set, get) => ({
    commits: [],
    streakData: {
        currentStreak: 0,
        longestStreak: 0,
        lastCommitDate: null,
    },
    loading: false,
    pendingOperations: [],
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
    addPendingOperation: async (operation) => {
        set((state) => ({
            pendingOperations: [...state.pendingOperations, operation]
        }));
        // Save to AsyncStorage
        const operations = [...get().pendingOperations];
        await AsyncStorage.setItem('pendingCommitOperations', JSON.stringify(operations));
    },
    removePendingOperation: async (id) => {
        set((state) => ({
            pendingOperations: state.pendingOperations.filter(op => op.id !== id)
        }));
        // Update AsyncStorage
        const operations = [...get().pendingOperations];
        await AsyncStorage.setItem('pendingCommitOperations', JSON.stringify(operations));
    },
    loadPendingOperations: async () => {
        const stored = await AsyncStorage.getItem('pendingCommitOperations');
        if (stored) {
            set({ pendingOperations: JSON.parse(stored) });
        }
    },
}));

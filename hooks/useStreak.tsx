import { useEffect } from "react";
import { useCommitStore } from "@/store/CommitStore";
import { DailyCommit, StreakData } from "@/types/Commit.types";

export const useStreak = () => {
    const { commits, setStreakData } = useCommitStore();

    const calculateStreak = (commits: DailyCommit[]): StreakData => {
        if (!commits || commits.length === 0) {
            return {
                currentStreak: 0,
                longestStreak: 0,
                lastCommitDate: null,
            };
        }

        const sortedCommits = [...commits].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        const uniqueDates = Array.from(new Set(sortedCommits.map((c) => c.date)));

        let currentStreak = 0;
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

        const startDate = uniqueDates[0] === today || uniqueDates[0] === yesterday 
            ? uniqueDates[0] 
            : null;

        if (startDate) {
            currentStreak = 1;
            let expectedDate = new Date(startDate);

            for (let i = 1; i < uniqueDates.length; i++) {
                expectedDate = new Date(expectedDate.getTime() - 86400000); // Previous day
                const expectedDateString = expectedDate.toISOString().split("T")[0];

                if (uniqueDates[i] === expectedDateString) {
                    currentStreak++;
                } else {
                    break;
                }
            }
        }

        // Calculate longest streak
        let longestStreak = 0;
        let tempStreak = 1;

        for (let i = 0; i < uniqueDates.length - 1; i++) {
            const currentDate = new Date(uniqueDates[i]);
            const nextDate = new Date(uniqueDates[i + 1]);
            const diffInDays = Math.floor(
                (currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (diffInDays === 1) {
                tempStreak++;
            } else {
                longestStreak = Math.max(longestStreak, tempStreak);
                tempStreak = 1;
            }
        }
        longestStreak = Math.max(longestStreak, tempStreak);

        return {
            currentStreak,
            longestStreak,
            lastCommitDate: uniqueDates[0] || null,
        };
    };

    useEffect(() => {
        const streakData = calculateStreak(commits);
        setStreakData(streakData);
    }, [commits, setStreakData]);

    return {
        calculateStreak,
    };
};

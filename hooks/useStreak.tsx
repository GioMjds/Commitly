import { useCommitStore } from "@/store/CommitStore";
import { DailyCommit, StreakData } from "@/types/Commit.types";
import {
    differenceInDays,
    format,
    isToday,
    isYesterday,
    parseISO,
    startOfDay,
    subDays
} from 'date-fns';
import { useEffect } from "react";

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

        // Sort commits by date (most recent first)
        const sortedCommits = [...commits].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // Get unique dates using date-fns for proper timezone handling
        const uniqueDates = Array.from(
            new Set(
                sortedCommits.map((c) => {
                    const commitDate = parseISO(c.date);
                    return format(startOfDay(commitDate), 'yyyy-MM-dd');
                })
            )
        );

        let currentStreak = 0;
        
        // Parse the most recent commit date
        const mostRecentDate = parseISO(uniqueDates[0]);
        const mostRecentDay = startOfDay(mostRecentDate);

        // Check if streak is active (commit today or yesterday)
        if (isToday(mostRecentDay) || isYesterday(mostRecentDay)) {
            currentStreak = 1;
            let expectedDate = subDays(mostRecentDay, 1);

            // Count consecutive days
            for (let i = 1; i < uniqueDates.length; i++) {
                const currentCommitDate = startOfDay(parseISO(uniqueDates[i]));
                
                if (differenceInDays(expectedDate, currentCommitDate) === 0) {
                    currentStreak++;
                    expectedDate = subDays(currentCommitDate, 1);
                } else {
                    break;
                }
            }
        }

        // Calculate longest streak
        let longestStreak = 0;
        let tempStreak = 1;

        for (let i = 0; i < uniqueDates.length - 1; i++) {
            const currentDate = startOfDay(parseISO(uniqueDates[i]));
            const nextDate = startOfDay(parseISO(uniqueDates[i + 1]));
            const diffInDays = differenceInDays(currentDate, nextDate);

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

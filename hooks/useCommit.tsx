import { firestore } from "@/configs/firebase";
import { useAuthStore } from "@/store/AuthStore";
import { useCommitStore } from "@/store/CommitStore";
import { CommitFormData, DailyCommit } from "@/types/Commit.types";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    updateDoc,
    where,
} from "firebase/firestore";
import { useCallback } from "react";

export const useCommit = () => {
    const { user } = useAuthStore();
    const { setCommits, addCommit, updateCommit, deleteCommit, setLoading } = useCommitStore();

    const fetchCommits = useCallback(async () => {
        if (!user) {
            return { success: false, message: "User not authenticated" };
        }

        setLoading(true);
        try {
            const q = query(
                collection(firestore, "commits"),
                where("userId", "==", user.uid),
                orderBy("createdAt", "desc")
            );

            const querySnapshot = await getDocs(q);

            const commits: DailyCommit[] = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
                updatedAt: doc.data().updatedAt?.toDate(),
            })) as DailyCommit[];

            setCommits(commits);
            return { success: true, commits };
        } catch (error: any) {
            const message = error?.message || "Failed to fetch commits";
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, [user, setCommits, setLoading]);

    const createCommit = async (data: CommitFormData) => {
        if (!user) return { success: false, message: "User not authenticated" };

        setLoading(true);
        try {
            const now = new Date();
            const dateString = now.toISOString().split("T")[0];

            const commitData = {
                userId: user.uid,
                note: data.note,
                title: data.title || undefined,
                timeSpent: data.timeSpent || undefined,
                timeUnit: data.timeUnit || undefined,
                difficulty: data.difficulty || undefined,
                description: data.description || undefined,
                createdAt: now,
                updatedAt: now,
                date: dateString,
            };

            const docRef = await addDoc(collection(firestore, "commits"), commitData);

            const newCommit: DailyCommit = {
                id: docRef.id,
                ...commitData,
            };

            addCommit(newCommit);

            return {
                success: true,
                commit: newCommit,
                message: "Commit created successfully!",
            };
        } catch (error: any) {
            const message = error?.message || "Failed to create commit";
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    };

    const editCommit = async (id: string, data: CommitFormData) => {
        if (!user) return { success: false, message: "User not authenticated" };

        setLoading(true);
        try {
            const now = new Date();
            const commitRef = doc(firestore, "commits", id);

            const updateData = {
                note: data.note,
                tag: data.tag || undefined,
                mood: data.mood || undefined,
                title: data.title || undefined,
                timeSpent: data.timeSpent || undefined,
                timeUnit: data.timeUnit || undefined,
                difficulty: data.difficulty || undefined,
                description: data.description || undefined,
                updatedAt: now,
            };

            await updateDoc(commitRef, updateData);
            updateCommit(id, { ...updateData, updatedAt: now });

            return {
                success: true,
                message: "Commit updated successfully!",
            };
        } catch (error: any) {
            const message = error?.message || "Failed to update commit";
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    };

    const removeCommit = async (id: string) => {
        if (!user) return { success: false, message: "User not authenticated" };

        setLoading(true);
        try {
            await deleteDoc(doc(firestore, "commits", id));
            deleteCommit(id);

            return {
                success: true,
                message: "Commit deleted successfully!",
            };
        } catch (error: any) {
            const message = error?.message || "Failed to delete commit";
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    };

    return {
        fetchCommits,
        createCommit,
        editCommit,
        removeCommit,
    };
};

import { firestore } from "@/configs/firebase";
import { useAuthStore } from "@/store/AuthStore";
import { useCommitStore } from "@/store/CommitStore";
import { CommitFormData, DailyCommit } from "@/types/Commit.types";
import NetInfo from "@react-native-community/netinfo";
import * as Haptics from 'expo-haptics';
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
import { useCallback, useEffect } from "react";

export const useCommit = () => {
    const { user } = useAuthStore();
    const { 
        setCommits, 
        addCommit, 
        updateCommit, 
        deleteCommit, 
        setLoading,
        pendingOperations,
        addPendingOperation,
        removePendingOperation,
        loadPendingOperations
    } = useCommitStore();

    useEffect(() => {
        loadPendingOperations();
    }, [loadPendingOperations]);

    const processPendingOperations = useCallback(async () => {
        for (const operation of pendingOperations) {
            try {
                if (operation.operation === 'create') {
                    // Filter out undefined values before sending to Firebase
                    const cleanData = Object.fromEntries(
                        Object.entries(operation.data).filter(([_, value]) => value !== undefined)
                    );
                    const docRef = await addDoc(collection(firestore, "commits"), cleanData);
                    updateCommit(operation.id, { id: docRef.id });
                } else if (operation.operation === 'update') {
                    // Filter out undefined values before sending to Firebase
                    const cleanData = Object.fromEntries(
                        Object.entries(operation.data).filter(([_, value]) => value !== undefined)
                    );
                    await updateDoc(doc(firestore, "commits", operation.id), cleanData);
                } else if (operation.operation === 'delete') {
                    await deleteDoc(doc(firestore, "commits", operation.id));
                }
                removePendingOperation(operation.id);
            } catch (error) {
                console.error('Failed to process pending operation:', error);
            }
        }
    }, [pendingOperations, removePendingOperation, updateCommit]);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            if (state.isConnected && pendingOperations.length > 0) {
                processPendingOperations();
            }
        });

        return () => unsubscribe();
    }, [pendingOperations, processPendingOperations]);

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

        const now = new Date();
        const dateString = now.toISOString().split("T")[0];
        const optimisticId = `temp_${Date.now()}`;

        const commitData: any = {
            userId: user.uid,
            note: data.note,
            createdAt: now,
            updatedAt: now,
            date: dateString,
        };

        if (data.title) commitData.title = data.title;
        if (data.timeSpent !== undefined && data.timeSpent !== null) commitData.timeSpent = data.timeSpent;
        if (data.timeUnit) commitData.timeUnit = data.timeUnit;
        if (data.difficulty) commitData.difficulty = data.difficulty;
        if (data.description) commitData.description = data.description;

        const optimisticCommit: DailyCommit = {
            id: optimisticId,
            userId: user.uid,
            note: data.note,
            createdAt: now,
            updatedAt: now,
            date: dateString,
            ...(data.title && { title: data.title }),
            ...(data.timeSpent !== undefined && data.timeSpent !== null && { timeSpent: data.timeSpent }),
            ...(data.timeUnit && { timeUnit: data.timeUnit }),
            ...(data.difficulty && { difficulty: data.difficulty }),
            ...(data.description && { description: data.description }),
        };

        // Optimistic UI update - add immediately
        addCommit(optimisticCommit);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Check network status
        const netState = await NetInfo.fetch();
        
        if (!netState.isConnected) {
            await addPendingOperation({
                id: optimisticId,
                data: commitData,
                operation: 'create',
                timestamp: Date.now()
            });

            return {
                success: true,
                commit: optimisticCommit,
                message: "Commit saved offline. Will sync when online.",
                offline: true
            };
        }

        // Try to sync immediately if online
        setLoading(true);
        try {
            const docRef = await addDoc(collection(firestore, "commits"), commitData);

            // Update with real ID
            const realCommit: DailyCommit = {
                ...optimisticCommit,
                id: docRef.id,
            };
            
            updateCommit(optimisticId, { id: docRef.id });

            return {
                success: true,
                commit: realCommit,
                message: "Commit created successfully!",
            };
        } catch {
            await addPendingOperation({
                id: optimisticId,
                data: commitData,
                operation: 'create',
                timestamp: Date.now()
            });

            return { 
                success: true, 
                commit: optimisticCommit,
                message: "Saved locally. Will sync when connection improves.",
                offline: true
            };
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

            const updateData: any = {
                note: data.note,
                updatedAt: now,
            };

            if (data.title) updateData.title = data.title;
            if (data.timeSpent !== undefined && data.timeSpent !== null) updateData.timeSpent = data.timeSpent;
            if (data.timeUnit) updateData.timeUnit = data.timeUnit;
            if (data.difficulty) updateData.difficulty = data.difficulty;
            if (data.description) updateData.description = data.description;

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

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

    // Load pending operations on mount
    useEffect(() => {
        loadPendingOperations();
    }, [loadPendingOperations]);

    const processPendingOperations = useCallback(async () => {
        for (const operation of pendingOperations) {
            try {
                if (operation.operation === 'create') {
                    const docRef = await addDoc(collection(firestore, "commits"), operation.data);
                    // Update the optimistic commit with real ID
                    updateCommit(operation.id, { id: docRef.id });
                } else if (operation.operation === 'update') {
                    await updateDoc(doc(firestore, "commits", operation.id), operation.data);
                } else if (operation.operation === 'delete') {
                    await deleteDoc(doc(firestore, "commits", operation.id));
                }
                await removePendingOperation(operation.id);
            } catch (error) {
                console.error('Failed to process pending operation:', error);
            }
        }
    }, [pendingOperations, removePendingOperation, updateCommit]);

    // Process pending operations when online
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

        const commitData = {
            userId: user.uid,
            note: data.note,
            title: data.title || undefined,
            timeSpent: data.timeSpent || undefined,
            timeUnit: data.timeUnit || undefined,
            difficulty: data.difficulty || undefined,
            description: data.description || undefined,
            tag: data.tag || undefined,
            mood: data.mood || undefined,
            createdAt: now,
            updatedAt: now,
            date: dateString,
        };

        const optimisticCommit: DailyCommit = {
            id: optimisticId,
            ...commitData,
        };

        // Optimistic UI update - add immediately
        addCommit(optimisticCommit);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Check network status
        const netState = await NetInfo.fetch();
        
        if (!netState.isConnected) {
            // Save to pending operations for later sync
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
            // On error, keep optimistic UI and queue for later
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

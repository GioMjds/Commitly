import { database } from "@/configs/firebase";
import { useAuthStore } from "@/store/AuthStore";
import { get, onValue, ref, set } from "firebase/database";
import { useEffect, useState } from "react";

interface CallItADayStatus {
	lastCalledDate: string | null;
	calledToday: boolean;
}

export const useCallItADay = () => {
	const [status, setStatus] = useState<CallItADayStatus>({
		lastCalledDate: null,
		calledToday: false,
	});
	const [loading, setLoading] = useState<boolean>(false);

	const { user } = useAuthStore();

	useEffect(() => {
		if (!user) return;

		const statusRef = ref(database, `users/${user.uid}/callItADay`);
		
		const unsubscribe = onValue(statusRef, (snapshot) => {
			if (snapshot.exists()) {
				const data = snapshot.val();
				const today = new Date().toISOString().split('T')[0];
				
				setStatus({
					lastCalledDate: data.lastCalledDate,
					calledToday: data.lastCalledDate === today,
				});
			} else {
				setStatus({
					lastCalledDate: null,
					calledToday: false,
				});
			}
		});

		return () => unsubscribe();
	}, [user]);

	const callItADay = async (): Promise<{ success: boolean; message: string }> => {
		if (!user) {
			return { success: false, message: 'User not authenticated' };
		}

		setLoading(true);

		try {
			const today = new Date().toISOString().split('T')[0];
			const statusRef = ref(database, `users/${user.uid}/callItADay`);

			// Check if already called today (double-check)
			const snapshot = await get(statusRef);
			if (snapshot.exists() && snapshot.val().lastCalledDate === today) {
				return { 
					success: false, 
					message: "You've already called it a day! See you tomorrow! 👋" 
				};
			}

			await set(statusRef, {
				lastCalledDate: today,
				timestamp: new Date().toISOString(),
			});

			return {
				success: true,
				message: "Great work today! Time to rest and recharge. See you tomorrow! 🌙",
			};
		} catch (error: any) {
			return {
				success: false,
				message: `Failed to mark day as complete: ${error.message}`,
			};
		} finally {
			setLoading(false);
		}
	};

	const canCallItADay = (): boolean => {
		return !status.calledToday;
	};

	return {
		status,
		callItADay,
		canCallItADay,
		loading,
	};
};

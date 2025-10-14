import { auth } from "@/configs/firebase";
import { useAuthStore } from "@/store/AuthStore";
import { AuthForms } from "@/types/FirebaseAuth.types";
import { Asset } from "expo-asset";
import { useMutation } from "@tanstack/react-query";
import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from "firebase/auth";

export const useAuth = () => {
    const setUser = useAuthStore((state) => state.setUser);
    const setLoading = useAuthStore((state) => state.setLoading);

    const register = useMutation({
        mutationFn: async ({ email, password }: AuthForms) => {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            const defaultPhotoURL = Asset.fromModule(require("@/assets/images/Default_pfp.jpg")).uri;

            await updateProfile(userCredential.user, {
                photoURL: defaultPhotoURL
            });

            await sendEmailVerification(userCredential.user);

            return userCredential.user;
        },
        onMutate: () => {
            setLoading(true);
        },
        onSuccess: (user) => {
            return {
                success: true,
                user,
                message: "Registration successful! Please verify your email."
            }
        },
        onError: (error: any) => {
            const message = error?.message;
            return { success: false, message: message || 'Registration failed. Please try again.' };
        },
        onSettled: () => {
            setLoading(false);
        }
    })

    const login = useMutation({
        mutationFn: async ({ email, password }: AuthForms) => {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );
            if (!userCredential.user.emailVerified) {
                await signOut(auth);
                return {
                    success: false,
                    message: "Please verify your email before logging in."
                };
            }
            setUser(userCredential.user);
            return userCredential.user;
        },
        onMutate: () => {
            setLoading(true);
        },
        onSuccess: (user) => {
            return {
                success: true,
                user,
                message: "Login successful!"
            };
        },
        onError: (error: any) => {
            let message = error?.message || String(error) || 'Login failed. Please try again.';

            if (error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential') {
                message = 'Incorrect password. Please try again.';
            } else if (error?.code === 'auth/user-not-found') {
                message = 'No account found for this email.';
            } else if (error?.code === 'auth/too-many-requests') {
                message = 'Too many login attempts. Please try again later.';
            }

            return { success: false, message };
        },
        onSettled: () => {
            setLoading(false);
        }
    });

    const forgotPassword = useMutation({
        mutationFn: async (email: string) => {
            await sendPasswordResetEmail(auth, email);
            return email;
        },
        onMutate: () => setLoading(true),
        onSuccess: (email) => {
            return {
                success: true,
                message: `Password reset email sent to ${email}. Please check your inbox.`
            }
        },
        onError: (error: any) => {
            const message = error?.message;
            return { success: false, message: message };
        },
        onSettled: () => setLoading(false)
    });

    const logout = useMutation({
        mutationFn: async () => {
            await signOut(auth);
            setUser(null);
        },
        onMutate: () => setLoading(true),
        onSuccess: () => {
            return { success: true, message: "Logout successful!" };
        },
        onError: (error: any) => {
            const message = error?.message;
            return { success: false, message: message };
        },
        onSettled: () => setLoading(false)
    });

    return { register, login, forgotPassword, logout };
}
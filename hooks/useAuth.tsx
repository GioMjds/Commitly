import { auth } from "@/configs/firebase";
import { useAuthStore } from "@/store/AuthStore";
import { AuthForms } from "@/types/FirebaseAuth.types";
import { Asset } from "expo-asset";
import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from "firebase/auth";

export const useAuth = () => {
    const { setUser, setLoading } = useAuthStore();

    const register = async ({ email, password }: AuthForms) => {
        setLoading(true);
        try {
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

            return {
                success: true,
                user: userCredential.user,
                message: "Registration successful! Please verify your email."
            };
        } catch (error: any) {
            const message = error?.message || String(error) || 'Registration failed. Please try again.';
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    };

    const login = async ({ email, password }: AuthForms) => {
        setLoading(true);
        try {
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

            return {
                success: true,
                user: userCredential.user,
                message: "Login successful!"
            }
        } catch (error: any) {
            let message = error?.message || String(error) || 'Login failed. Please try again.';
            if (error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential') {
                message = 'Incorrect password. Please try again.';
            } else if (error?.code === 'auth/user-not-found') {
                message = 'No account found for this email.';
            } else if (error?.code === 'auth/too-many-requests') {
                message = 'Too many login attempts. Please try again later.';
            }

            return { success: false, message };
        } finally {
            setLoading(false);
        }
    };
    
    const forgotPassword = async (email: string) => {
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            return {
                success: true,
                message: "Password reset email sent! Please check your inbox."
            }
        } catch (error: any) {
            const message = error?.message || String(error) || 'Failed to send password reset email.';
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await signOut(auth);
            setUser(null);
            return { success: true, message: "Logout successful!" };
        } catch (error: any) {
            const message = error?.message || String(error) || 'Logout failed. Please try again.';
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }

    return { register, login, forgotPassword, logout };
}
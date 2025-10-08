import {  
    createUserWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from "firebase/auth";
import { auth } from "@/configs/firebase";
import { useAuthStore } from "@/store/AuthStore";
import { AuthForms } from "@/types/FirebaseAuth.types";
import { Asset } from "expo-asset";

export const useAuth = () => {
    const { setUser, setLoading } = useAuthStore();

    const register = async ({ email, password }: AuthForms) => {
        try {
            setLoading(true);
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
        } catch (error) {
            return { success: false, message: error };
        } finally {
            setLoading(false);
        }
    };

    const login = async ({ email, password }: AuthForms) => {
        try {
            setLoading(true);
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            await userCredential.user.reload();

            if (!userCredential.user.emailVerified) {
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
        } catch (error) {
            return { success: false, message: error };
        } finally {
            setLoading(false);
        }
    };

    const forgotPassword = async (email: string) => {
        try {
            setLoading(true);
            await sendPasswordResetEmail(auth, email);
            return {
                success: true,
                message: "Password reset email sent! Please check your inbox."
            }
        } catch (error) {
            return { success: false, message: error };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            await signOut(auth);
            setUser(null);
            return { success: true, message: "Logout successful!" };
        } catch (error) {
            return { success: false, message: error };
        } finally {
            setLoading(false);
        }
    }

    return { register, login, forgotPassword, logout };
}
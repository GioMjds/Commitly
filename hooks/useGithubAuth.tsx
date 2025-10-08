import { auth } from "@/configs/firebase";
import { useAuthStore } from "@/store/AuthStore";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import { GithubAuthProvider, signInWithCredential } from "firebase/auth";
import { useEffect } from "react";
import axios from "axios";
import { router } from "expo-router";

WebBrowser.maybeCompleteAuthSession();

const discovery = {
    authorizationEndpoint: "https://github.com/login/oauth/authorize",
    tokenEndpoint: "https://github.com/login/oauth/access_token",
    revocationEndpoint: `https://github.com/settings/connections/applications/${process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID}`,
};

export const useGithubAuth = () => {
    const { setUser, setLoading } = useAuthStore();

    const redirectUri = makeRedirectUri();

    const [request, response, promptAsync] = useAuthRequest(
        {
            clientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID!,
            scopes: ["read:user", "user:email"],
            redirectUri,
            usePKCE: false,
        },
        discovery
    );

    useEffect(() => {
        if (response?.type === "success") {
            const { code } = response.params;
            handleGithubSignIn(code);
        } else if (response?.type === "error") {
            console.error("GitHub OAuth error:", response.error);
        }
    }, [response]);

    const handleGithubSignIn = async (code: string) => {
        setLoading(true);
        try {
            const tokenResponse = await axios.post(
                "https://github.com/login/oauth/access_token",
                {
                    client_id: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID,
                    client_secret: process.env.EXPO_PUBLIC_GITHUB_CLIENT_SECRET,
                    code,
                    redirect_uri: redirectUri,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                }
            );

            const tokenData = tokenResponse.data;
            
            if (tokenData.access_token) {
                const credential = GithubAuthProvider.credential(tokenData.access_token);
                const userCredential = await signInWithCredential(auth, credential);
                setUser(userCredential.user);

                router.replace("/(screens)");

                return {
                    success: true,
                    user: userCredential.user,
                    message: "GitHub sign-in successful!",
                };
            } else {
                throw new Error(tokenData.error_description || "Failed to get access token");
            }
        } catch (error: any) {
            console.error("GitHub sign-in error:", error);
            const message = error?.response?.data?.error_description || error?.message || "GitHub sign-in failed";
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    };

    const signInWithGithub = async () => {
        try {
            const result = await promptAsync();
            if (result.type !== "success") {
                return {
                    success: false,
                    message: "GitHub sign-in was cancelled",
                };
            }
        } catch (error: any) {
            console.error("GitHub prompt error:", error);
            return {
                success: false,
                message: error?.message || "Failed to initiate GitHub sign-in",
            };
        }
    };

    return { signInWithGithub, request };
};
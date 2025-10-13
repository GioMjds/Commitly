import { auth, database } from "@/configs/firebase";
import { useAuthStore } from "@/store/AuthStore";
import axios from "axios";
import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import { GithubAuthProvider, linkWithCredential, signInWithCredential, updateProfile } from "firebase/auth";
import { ref, set } from "firebase/database";
import { useCallback, useEffect, useState } from "react";

WebBrowser.maybeCompleteAuthSession();

const discovery = {
    authorizationEndpoint: process.env.EXPO_PUBLIC_GITHUB_AUTHORIZATION_ENDPOINT,
    tokenEndpoint: process.env.EXPO_PUBLIC_GITHUB_TOKEN_ENDPOINT,
    revocationEndpoint: process.env.EXPO_PUBLIC_GITHUB_REVOCATION_ENDPOINT,
};

export const useGithubAuth = () => {
    const { setUser } = useAuthStore();
    const [isLinking, setIsLinking] = useState<boolean>(false);
    const [githubLoading, setGithubLoading] = useState<boolean>(false);

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

    const handleGithubSignIn = useCallback(async (code: string, linkMode = false) => {
        setGithubLoading(true);
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
                
                // Get GitHub user info first
                const githubUserResponse = await axios.get(
                    "https://api.github.com/user",
                    {
                        headers: {
                            Authorization: `Bearer ${tokenData.access_token}`,
                        },
                    }
                );

                let userCredential;
                
                // Build displayName from GitHub name + @username
                const ghName = githubUserResponse.data.name;
                const ghLogin = githubUserResponse.data.login;
                const displayName = ghName
                    ? `${ghName}${ghLogin ? ` @${ghLogin}` : ''}`
                    : ghLogin
                    ? `@${ghLogin}`
                    : undefined;

                // Link mode: link GitHub to existing email/password account
                if (linkMode && auth.currentUser) {
                    userCredential = await linkWithCredential(auth.currentUser, credential);

                    // Update profile with GitHub photo and displayName when available
                    const profileUpdate: { displayName?: string | null; photoURL?: string | null } = {};
                    if (displayName) profileUpdate.displayName = displayName;
                    if (githubUserResponse.data.avatar_url) profileUpdate.photoURL = githubUserResponse.data.avatar_url;

                    if (Object.keys(profileUpdate).length > 0) {
                        await updateProfile(userCredential.user, profileUpdate);
                    }

                    // Ensure store gets the latest user
                    setUser(auth.currentUser);
                } else {
                    // Sign-in mode: create new session with GitHub
                    userCredential = await signInWithCredential(auth, credential);

                    // Update profile with GitHub displayName and photo
                    const profileUpdate: { displayName?: string | null; photoURL?: string | null } = {};
                    if (displayName) profileUpdate.displayName = displayName;
                    if (githubUserResponse.data.avatar_url) profileUpdate.photoURL = githubUserResponse.data.avatar_url;

                    if (Object.keys(profileUpdate).length > 0) {
                        await updateProfile(userCredential.user, profileUpdate);
                    }

                    // Ensure store gets the latest user
                    setUser(auth.currentUser);
                }

                // Store GitHub access token securely
                await SecureStore.setItemAsync(
                    `github_token_${userCredential.user.uid}`,
                    tokenData.access_token
                );

                // Store GitHub username and name in Realtime Database
                await set(
                    ref(database, `users/${userCredential.user.uid}/github`),
                    {
                        username: githubUserResponse.data.login,
                        name: githubUserResponse.data.name || null,
                        tokenStored: true,
                        avatarUrl: githubUserResponse.data.avatar_url,
                    }
                );

                if (!linkMode) {
                    router.replace("/(screens)");
                }

                return {
                    success: true,
                    user: userCredential.user,
                    message: linkMode 
                        ? "GitHub account linked successfully!" 
                        : "GitHub sign-in successful!",
                };
            } else {
                throw new Error(tokenData.error_description || "Failed to get access token");
            }
        } catch (error: any) {
            console.error("GitHub operation error:", error);
            
            // Handle account-exists-with-different-credential error
            if (error.code === 'auth/credential-already-in-use' || 
                error.code === 'auth/email-already-in-use') {
                return { 
                    success: false, 
                    message: "This GitHub account is already linked to another user" 
                };
            }
            
            const message = error?.response?.data?.error_description || 
                           error?.message || 
                           (linkMode ? "Failed to link GitHub account" : "GitHub sign-in failed");
            return { success: false, message };
        } finally {
            setGithubLoading(false);
            setIsLinking(false);
        }
    }, [setUser, redirectUri]);

    useEffect(() => {
        if (response?.type === "success") {
            const { code } = response.params;
            handleGithubSignIn(code, isLinking);
        } else if (response?.type === "error") {
            console.error("GitHub OAuth error:", response.error);
            setIsLinking(false);
        }
    }, [response, isLinking, handleGithubSignIn]);

    const signInWithGithub = async () => {
        try {
            setIsLinking(false);
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

    const linkGithubAccount = async () => {
        try {
            if (!auth.currentUser) {
                return {
                    success: false,
                    message: "You must be signed in to link GitHub account",
                };
            }

            setIsLinking(true);
            const result = await promptAsync();
            
            if (result.type !== "success") {
                setIsLinking(false);
                return {
                    success: false,
                    message: "GitHub linking was cancelled",
                };
            }
            
            // The actual linking happens in the useEffect hook
            return { success: true };
        } catch (error: any) {
            console.error("GitHub linking error:", error);
            setIsLinking(false);
            return {
                success: false,
                message: error?.message || "Failed to link GitHub account",
            };
        }
    };

    return { signInWithGithub, linkGithubAccount, request, githubLoading };
};
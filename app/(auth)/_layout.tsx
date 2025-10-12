import { useThemedStyles } from "@/hooks/useThemedStyles";
import { useAuthStore } from "@/store/AuthStore";
import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function AuthLayout() {
    const { user } = useAuthStore();
    const { isDark } = useThemedStyles();

    const isGitHubUser = user?.providerData?.some(
        provider => provider.providerId === 'github.com'
    );

    if (user && (user.emailVerified || isGitHubUser)) {
        return <Redirect href="/(screens)" />;
    }

    return (
        <>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <Stack screenOptions={{ headerShown: false }} />
        </>
    )
}
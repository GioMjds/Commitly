import { useAuthStore } from "@/store/AuthStore";
import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function AuthLayout() {
    const { user } = useAuthStore();

    if (user && user.emailVerified) {
        return <Redirect href="/(screens)" />;
    }

    return (
        <>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }} />
        </>
    )
}
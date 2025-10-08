import { useAuthStore } from "@/store/AuthStore";
import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function ScreensLayout() {
    const { user } = useAuthStore();

    if (!user) {
        return <Redirect href="/(auth)/login" />;
    }

    return (
        <>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }} />
        </>
    )
}
import { useThemedStyles } from "@/hooks/useThemedStyles";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function AddLayout() {
    const { isDark } = useThemedStyles();

    return (
        <>
            <StatusBar style={isDark ? "light" : "dark"} />
            <Stack screenOptions={{ headerShown: false }} />
        </>
    )
}
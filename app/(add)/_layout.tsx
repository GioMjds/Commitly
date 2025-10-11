import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function AddLayout() {
    return (
        <>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }} />
        </>
    )
}
import CustomTabBar from "@/components/layout/Tabs";
import { useAuthStore } from "@/store/AuthStore";
import { Redirect, Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function ScreensLayout() {
    const { user, loading } = useAuthStore();

    if (loading) {
        return null;
    }

    if (!user) {
        return <Redirect href="/(auth)/login" />;
    }

    return (
        <>
            <StatusBar style="dark" />
            <Tabs
                tabBar={(props) => <CustomTabBar {...props} />}
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "Dashboard",
                    }}
                />
                <Tabs.Screen
                    name="add-commit"
                    options={{
                        title: "Add",
                        tabBarStyle: { display: "none" },
                    }}
                />
                <Tabs.Screen
                    name="history"
                    options={{
                        title: "History",
                    }}
                />
                <Tabs.Screen
                    name="settings"
                    options={{
                        title: "Settings",
                    }}
                />
            </Tabs>
        </>
    );
}

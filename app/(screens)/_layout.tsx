import CustomTabBar from "@/components/layout/Tabs";
import { useThemedStyles } from "@/hooks/useThemedStyles";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function ScreensLayout() {
    const { isDark } = useThemedStyles();

    return (
        <>
            <StatusBar style={isDark ? "light" : "dark"} />
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
                    name="commits"
                    options={{
                        title: "Commits",
                    }}
                />
                <Tabs.Screen
                    name="settings"
                    options={{
                        href: null,
                    }}
                />
            </Tabs>
        </>
    );
}

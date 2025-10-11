import CustomTabBar from "@/components/layout/Tabs";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function ScreensLayout() {
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
                    name="history"
                    options={{
                        title: "History",
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

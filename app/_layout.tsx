import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import "../global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from 'expo-router';
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/configs/firebase";
import { useAuthStore } from "@/store/AuthStore";
import { useFonts } from "expo-font";

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
    initialRouteName: "(auth)",
};

export default function RootLayout() {
	const { setUser, setLoading } = useAuthStore();

	const [fontsLoaded] = useFonts({
		'HubotSans-Black': require("@/assets/fonts/HubotSans-Black.ttf"),
        'HubotSans-ExtraBold': require("@/assets/fonts/HubotSans-ExtraBold.ttf"),
        'HubotSans-ExtraLight': require("@/assets/fonts/HubotSans-ExtraLight.ttf"),
        'HubotSans-Light': require("@/assets/fonts/HubotSans-Light.ttf"),
        'HubotSans-Medium': require("@/assets/fonts/HubotSans-Medium.ttf"),
        'HubotSans-Regular': require("@/assets/fonts/HubotSans-Regular.ttf"),
        'HubotSans-SemiBold': require("@/assets/fonts/HubotSans-SemiBold.ttf"),
	});

	useEffect(() => {
        async function prepare() {
            try {
                await SystemUI.setBackgroundColorAsync('#222831');
            } catch (e) {
                console.warn(e);
            } finally {
                await SplashScreen.hideAsync();
            }
        }

        prepare();

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, [setUser, setLoading, fontsLoaded]);
	
	return (
		<QueryClientProvider client={queryClient}>
			<SafeAreaProvider>
				<StatusBar style="auto" />
				<Stack>
                    <Stack.Screen name="(auth)" options={{ headerShown: false, animation: 'ios_from_right' }} />
                    <Stack.Screen name="(add)" options={{ headerShown: false, animation: 'ios_from_right' }} />
                    <Stack.Screen name="(screens)" options={{ headerShown: false, animation: 'ios_from_right' }} />
                </Stack>
			</SafeAreaProvider>
		</QueryClientProvider>
	);
}

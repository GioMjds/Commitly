import * as SplashScreen from 'expo-splash-screen';
import "../global.css";
import { auth } from "@/configs/firebase";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/AuthStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from 'expo-router';
import { StatusBar } from "expo-status-bar";
import * as SystemUI from 'expo-system-ui';
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
    initialRouteName: "(auth)",
};

export default function RootLayout() {
	const { setUser, setLoading } = useAuthStore();
	const { activeTheme } = useTheme();

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
	
	useEffect(() => {
		if (activeTheme === 'dark') {
			SystemUI.setBackgroundColorAsync('#0B1220');
		} else {
			SystemUI.setBackgroundColorAsync('#F8FAFC');
		}
	}, [activeTheme]);

	return (
		<QueryClientProvider client={queryClient}>
			<View className={activeTheme === 'dark' ? 'dark flex-1' : 'flex-1'} style={{ flex: 1 }}>
				<SafeAreaProvider>
					<StatusBar style={activeTheme === 'dark' ? 'light' : 'auto'} />
					<Stack>
						<Stack.Screen name="(auth)" options={{ headerShown: false, animation: 'fade' }} />
						<Stack.Screen name="(add)" options={{ headerShown: false, animation: 'fade' }} />
						<Stack.Screen name="(screens)" options={{ headerShown: false, animation: 'fade' }} />
					</Stack>
				</SafeAreaProvider>
			</View>
		</QueryClientProvider>
	);
}

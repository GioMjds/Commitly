import { auth } from "@/configs/firebase";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/AuthStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from "expo-status-bar";
import * as SystemUI from 'expo-system-ui';
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const user = useAuthStore((state) => state.user);
	const loading = useAuthStore((state) => state.loading);
	const setUser = useAuthStore((state) => state.setUser);
	const setLoading = useAuthStore((state) => state.setLoading);
	
	const segments = useSegments();
	const router = useRouter();
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

	// Initialize auth state
	useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, [setUser, setLoading]);

	// Handle navigation based on auth state
	useEffect(() => {
		if (loading || !fontsLoaded) return; // Wait for auth check and fonts

		const inAuthGroup = segments[0] === '(auth)';
		const isGitHubUser = user?.providerData?.some(
			(provider) => provider.providerId === 'github.com'
		) ?? false;

		if (user && (user.emailVerified || isGitHubUser)) {
			// User is authenticated - redirect to screens if in auth
			if (inAuthGroup || !segments[0]) {
				router.replace('/(screens)');
			}
		} else {
			// User not authenticated - redirect to login if not in auth
			if (!inAuthGroup) {
				router.replace('/(auth)/login');
			}
		}
	}, [user, loading, fontsLoaded, segments, router]);

	// Hide splash screen once ready
	useEffect(() => {
		if (!loading && fontsLoaded) {
			SplashScreen.hideAsync();
		}
	}, [loading, fontsLoaded]);
	
	useEffect(() => {
		if (activeTheme === 'dark') {
			SystemUI.setBackgroundColorAsync('#0B1220');
		} else {
			SystemUI.setBackgroundColorAsync('#F8FAFC');
		}
	}, [activeTheme]);

	// Show loading screen while checking auth or loading fonts
	if (loading || !fontsLoaded) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B1220' }}>
				<ActivityIndicator size="large" color="#7C3AED" />
			</View>
		);
	}

	return (
		<QueryClientProvider client={queryClient}>
			<View className={activeTheme === 'dark' ? 'dark flex-1' : 'flex-1'} style={{ flex: 1 }}>
				<SafeAreaProvider>
					<StatusBar style={activeTheme === 'dark' ? 'light' : 'auto'} />
					<Stack screenOptions={{ headerShown: false }}>
						<Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
						<Stack.Screen name="(add)" options={{ animation: 'fade' }} />
						<Stack.Screen name="(screens)" options={{ animation: 'fade' }} />
					</Stack>
				</SafeAreaProvider>
			</View>
		</QueryClientProvider>
	);
}

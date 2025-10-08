import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import StyledText from '@/components/ui/StyledText';

export default function AuthCallbackScreen() {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace('/(screens)');
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View className="flex-1 bg-neutral justify-center items-center">
            <ActivityIndicator size="large" color="#0066CC" />
            <StyledText variant="medium" className="text-primary text-xl mt-4">
                Completing GitHub sign-in...
            </StyledText>
        </View>
    );
}